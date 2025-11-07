import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bookingAPI } from "@/services/api";
import { toast } from "sonner";
import {
  getEnabledSeatingTypes,
  getSeatingTypePrice,
  calculateAdvancePayment,
  isAdvancePaymentEnabled,
  getAdvancePaymentPercentage,
} from "@/lib/settingsUtils";

const SubmitBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initialHours, setInitialHours] = useState(0);

  // Get available seating types from Settings
  const enabledSeatingTypes = getEnabledSeatingTypes();
  const defaultSeatingType =
    enabledSeatingTypes.length > 0 ? enabledSeatingTypes[0].key : "sleeper";

  const [formData, setFormData] = useState({
    bookingId: id || "",
    guestName: "",
    phoneNumber: "",
    numberOfPersons: "",
    bookingType: defaultSeatingType,
    bookingDate: "",
    inTime: "",
    outTime: "",
    proofType: "aadhaar",
    proofId: "",
    pricePerPerson: "",
    paidAmount: "",
    paymentMethod: "cash",
  });

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const response = await bookingAPI.getBookingById(id);
        const booking = response.data?.booking;

        if (!booking) {
          toast.error("Booking details not found");
          return;
        }

        setFormData({
          bookingId: booking.booking_id,
          guestName: booking.guest_name || "",
          phoneNumber: booking.phone_number || "",
          numberOfPersons: booking.number_of_persons?.toString() || "",
          bookingType: booking.booking_type || "sleeper",
          bookingDate: booking.booking_date
            ? booking.booking_date.split("T")[0]
            : "",
          inTime: booking.in_time?.slice(0, 5) || "",
          outTime: booking.out_time?.slice(0, 5) || "",
          proofType: booking.proof_type || "aadhaar",
          proofId: booking.proof_id || "",
          pricePerPerson: booking.price_per_person?.toString() || "",
          paidAmount: booking.paid_amount?.toString() || "",
          paymentMethod: booking.payment_method || "cash",
        });

        setInitialHours(Number(booking.total_hours) || 0);
      } catch (error: any) {
        console.error("Error loading booking", error);
        toast.error(
          error.response?.data?.message || "Failed to load booking details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  // Auto-fill price when booking type changes
  useEffect(() => {
    if (formData.bookingType && !formData.pricePerPerson) {
      const price = getSeatingTypePrice(formData.bookingType);
      if (price > 0) {
        setFormData((prev) => ({
          ...prev,
          pricePerPerson: price.toString(),
        }));
      }
    }
  }, [formData.bookingType]);

  const calculatedHours = useMemo(() => {
    if (formData.inTime && formData.outTime) {
      const [inHour, inMinute] = formData.inTime.split(":").map(Number);
      const [outHour, outMinute] = formData.outTime.split(":").map(Number);

      if (
        [inHour, inMinute, outHour, outMinute].some((value) => isNaN(value))
      ) {
        return initialHours;
      }

      let diff = outHour * 60 + outMinute - (inHour * 60 + inMinute);
      if (diff <= 0) {
        diff += 24 * 60;
      }
      return Math.max(1, Math.ceil(diff / 60));
    }
    return initialHours;
  }, [formData.inTime, formData.outTime, initialHours]);

  const totalAmount = useMemo(() => {
    const persons = Number(formData.numberOfPersons) || 0;
    const price = Number(formData.pricePerPerson) || 0;
    const hours = calculatedHours || 0;
    return persons * price * hours;
  }, [formData.numberOfPersons, formData.pricePerPerson, calculatedHours]);

  // Advance payment calculations
  const suggestedAdvanceAmount = useMemo(() => {
    return isAdvancePaymentEnabled() ? calculateAdvancePayment(totalAmount) : 0;
  }, [totalAmount]);

  const balanceAmount = useMemo(() => {
    const paid = Number(formData.paidAmount) || 0;
    return Math.max(totalAmount - paid, 0);
  }, [formData.paidAmount, totalAmount]);

  const handleSubmit = async () => {
    if (!id && !formData.bookingId) {
      toast.error("Booking ID is required");
      return;
    }

    const requiredFields: Array<[string, string]> = [
      [formData.guestName, "Guest name is required"],
      [formData.phoneNumber, "Phone number is required"],
      [formData.numberOfPersons, "Number of persons is required"],
      [formData.bookingType, "Booking type is required"],
      [formData.bookingDate, "Booking date is required"],
      [formData.inTime, "Check-in time is required"],
      [formData.outTime, "Checkout time is required"],
      [formData.proofType, "Proof type is required"],
      [formData.proofId, "Proof ID is required"],
      [formData.pricePerPerson, "Price per person is required"],
    ];

    const missing = requiredFields.find(([value]) => !value.trim());
    if (missing) {
      toast.error(missing[1]);
      return;
    }

    const bookingId = id || formData.bookingId;

    const payload = {
      guest_name: formData.guestName.trim(),
      phone_number: formData.phoneNumber.trim(),
      number_of_persons: Number(formData.numberOfPersons),
      booking_type: formData.bookingType,
      booking_date: formData.bookingDate,
      in_time: formData.inTime,
      out_time: formData.outTime,
      proof_type: formData.proofType,
      proof_id: formData.proofId.trim(),
      price_per_person: Number(formData.pricePerPerson),
      paid_amount: Number(formData.paidAmount || 0),
      payment_method: formData.paymentMethod,
    };

    try {
      setSubmitting(true);
      await bookingAPI.submitBooking(bookingId, payload);
      toast.success("Booking submitted successfully");
      navigate(`/booking-details-completed/${bookingId}`);
    } catch (error: any) {
      console.error("Error submitting booking", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to submit booking";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="p-6">
        {/* Header */}
        <div className="bg-nav rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-nav-foreground">
            Submit Booking
          </h1>
          <p className="text-nav-foreground/80">
            {loading
              ? "Loading booking details..."
              : "Complete the requirements to end booking"}
          </p>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Booking ID */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Booking ID
                </label>
                <Input
                  placeholder="e.g. BK001"
                  value={formData.bookingId}
                  onChange={(e) =>
                    setFormData({ ...formData, bookingId: e.target.value })
                  }
                  readOnly={Boolean(id)}
                />
              </div>

              {/* Guest Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Guest Name
                </label>
                <Input
                  placeholder="Enter full name"
                  value={formData.guestName}
                  onChange={(e) =>
                    setFormData({ ...formData, guestName: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <Input
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              {/* Number of Persons */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Persons
                </label>
                <Input
                  placeholder="Enter number"
                  value={formData.numberOfPersons}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numberOfPersons: e.target.value,
                    })
                  }
                  disabled={loading}
                />
              </div>

              {/* Booking Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Booking Type
                </label>
                <Select
                  value={formData.bookingType}
                  onValueChange={(value) => {
                    const price = getSeatingTypePrice(value);
                    setFormData({
                      ...formData,
                      bookingType: value,
                      pricePerPerson:
                        price > 0 ? price.toString() : formData.pricePerPerson,
                    });
                  }}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {enabledSeatingTypes.map((seatingType) => (
                      <SelectItem key={seatingType.key} value={seatingType.key}>
                        {seatingType.label} - ₹{seatingType.amount}/person/hour
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Booking Date & Time */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Booking Date & Time
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={formData.bookingDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookingDate: e.target.value,
                        })
                      }
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      In Time
                    </label>
                    <Input
                      type="time"
                      value={formData.inTime}
                      onChange={(e) =>
                        setFormData({ ...formData, inTime: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Out Time
                    </label>
                    <Input
                      type="time"
                      value={formData.outTime}
                      onChange={(e) =>
                        setFormData({ ...formData, outTime: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Proof Information */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Proof Information
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Proof Type
                    </label>
                    <Select
                      value={formData.proofType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, proofType: value })
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aadhaar">Aadhaar</SelectItem>
                        <SelectItem value="pan id">PAN</SelectItem>
                        <SelectItem value="pnr number">PNR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Proof ID
                    </label>
                    <Input
                      placeholder="Enter proof number"
                      value={formData.proofId}
                      onChange={(e) =>
                        setFormData({ ...formData, proofId: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Pricing Information
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Price per Person (₹)
                    </label>
                    <Input
                      placeholder="0"
                      value={formData.pricePerPerson}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricePerPerson: e.target.value.replace(
                            /[^0-9.]/g,
                            ""
                          ),
                        })
                      }
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Calculated Hours
                    </label>
                    <Input
                      value={
                        calculatedHours
                          ? `${calculatedHours} hour${
                              calculatedHours > 1 ? "s" : ""
                            }`
                          : "-"
                      }
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Total Amount (₹)
                    </label>
                    <Input
                      value={totalAmount ? totalAmount.toString() : "0"}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                {/* Advance Payment Info */}
                {isAdvancePaymentEnabled() && suggestedAdvanceAmount > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Advance Payment Suggested
                        </p>
                        <p className="text-xs text-blue-700">
                          {getAdvancePaymentPercentage()}% of total amount (₹
                          {totalAmount})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-900">
                          ₹{suggestedAdvanceAmount.toFixed(2)}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              paidAmount: suggestedAdvanceAmount.toString(),
                            }))
                          }
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Use as paid amount
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Paid Amount (₹)
                    </label>
                    <Input
                      placeholder="0"
                      value={formData.paidAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paidAmount: e.target.value.replace(/[^0-9.]/g, ""),
                        })
                      }
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Balance Amount (₹)
                    </label>
                    <Input
                      value={balanceAmount ? balanceAmount.toString() : "0"}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Payment Method
                    </label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) =>
                        setFormData({ ...formData, paymentMethod: value })
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-2 flex justify-center space-x-4 mt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || loading}
                  className="px-12 py-3 bg-primary hover:bg-primary/90 text-white rounded-md disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="px-12 py-3 border border-muted-foreground/30 hover:bg-muted/30 rounded-md"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubmitBooking;
