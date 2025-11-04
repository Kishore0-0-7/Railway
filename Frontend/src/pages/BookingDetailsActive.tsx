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

interface BookingDetailsData {
  booking_id: string;
  guest_name: string;
  phone_number: string;
  number_of_persons: number;
  booking_type: string;
  total_hours: number;
  booking_date: string;
  in_time: string;
  out_time: string;
  proof_type: string;
  proof_id: string;
  price_per_person: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_method: string;
  status: string;
  worker_name?: string;
  admin_name?: string;
}

interface FormDataType {
  bookingId: string;
  guestName: string;
  phoneNumber: string;
  numberOfPersons: string;
  bookingType: string;
  bookingDate: string;
  inTime: string;
  outTime: string;
  proofType: string;
  proofId: string;
  pricePerPerson: string;
  paidAmount: string;
  paymentMethod: string;
}

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // form state copied from SubmitBooking page (fields editable)
  const [initialHours, setInitialHours] = useState(0);
  const [formData, setFormData] = useState<FormDataType>({
    bookingId: id || "",
    guestName: "",
    phoneNumber: "",
    numberOfPersons: "",
    bookingType: "sleeper",
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
        const bookingData = response.data?.booking;

        if (!bookingData) {
          toast.error("Booking not found");
          return;
        }

        setBooking(bookingData);

        // populate editable form fields from fetched booking
        setFormData({
          bookingId: bookingData.booking_id,
          guestName: bookingData.guest_name || "",
          phoneNumber: bookingData.phone_number || "",
          numberOfPersons: bookingData.number_of_persons?.toString() || "",
          bookingType: bookingData.booking_type || "sleeper",
          bookingDate: bookingData.booking_date
            ? bookingData.booking_date.split("T")[0]
            : "",
          inTime: bookingData.in_time?.slice(0, 5) || "",
          outTime: bookingData.out_time?.slice(0, 5) || "",
          proofType: bookingData.proof_type || "aadhaar",
          proofId: bookingData.proof_id || "",
          pricePerPerson: bookingData.price_per_person?.toString() || "",
          paidAmount: bookingData.paid_amount?.toString() || "",
          paymentMethod: bookingData.payment_method || "cash",
        });

        setInitialHours(Number(bookingData.total_hours) || 0);
      } catch (error: any) {
        console.error("Error fetching booking", error);
        toast.error(
          error.response?.data?.message || "Failed to load booking details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const formatDate = (value?: string) => {
    if (!value) return "";
    if (value.includes("T")) return value.split("T")[0];
    return value;
  };

  const formatTime = (value?: string) => {
    if (!value) return "";
    return value.slice(0, 5);
  };

  // calculated hours based on in/out times (copied behavior from SubmitBooking)
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

  const balanceAmountComputed = useMemo(() => {
    const paid = Number(formData.paidAmount) || 0;
    return Math.max(totalAmount - paid, 0);
  }, [formData.paidAmount, totalAmount]);

  // submit handler copied from SubmitBooking (uses formData)
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

  const handleBack = () => {
    navigate(-1);
  };

  // keep legacy booking-based balance for display fallback if needed
  const balanceAmount = booking
    ? Math.max((booking.total_amount || 0) - (booking.paid_amount || 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-muted">
      <Navigation />

      <main className="p-6">
        {/* Header */}
        <div className="bg-black text-white rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold">Submit Booking</h1>
          <p className="text-gray-300">
            Complete the requirements to end booking
          </p>
        </div>

        {/* Booking Form */}
        <div className="max-w-9xl mx-auto bg-white rounded-lg shadow-sm p-8">
          {loading && (
            <p className="text-center text-muted-foreground">
              Loading booking details...
            </p>
          )}

          {!loading && !booking && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                No booking information found for ID {id}.
              </p>
              <Button variant="outline" onClick={handleBack}>
                Go Back
              </Button>
            </div>
          )}

          {!loading && booking && (
            <form className="space-y-8">
              {/* Booking Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Booking ID
                  </label>
                  <Input
                    value={formData.bookingId}
                    placeholder="e.g. #1225"
                    onChange={(e) =>
                      setFormData({ ...formData, bookingId: e.target.value })
                    }
                    readOnly={Boolean(id)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Guest Name
                  </label>
                  <Input
                    value={formData.guestName}
                    placeholder="Enter full name"
                    onChange={(e) =>
                      setFormData({ ...formData, guestName: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={formData.phoneNumber}
                    placeholder="+91 902 543 3001"
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Persons
                  </label>
                  <Input
                    value={formData.numberOfPersons}
                    placeholder="Enter number"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfPersons: e.target.value,
                      })
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Booking Type
                  </label>
                  <Select
                    value={formData.bookingType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bookingType: value })
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sleeper">Sleeper</SelectItem>
                      <SelectItem value="sitting">Sitting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Total Hours
                  </label>
                  <Input
                    value={calculatedHours ? calculatedHours.toString() : (booking.total_hours?.toString() || "0")}
                    placeholder="00"
                    readOnly
                  />
                </div>
              </div>

              {/* Booking Date & Time */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Booking Date & Time
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={formData.bookingDate}
                      onChange={(e) =>
                        setFormData({ ...formData, bookingDate: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      In Time
                    </label>
                    <Input
                      value={formData.inTime}
                      type="time"
                      onChange={(e) =>
                        setFormData({ ...formData, inTime: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Out Time
                    </label>
                    <Input
                      value={formData.outTime}
                      type="time"
                      onChange={(e) =>
                        setFormData({ ...formData, outTime: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Proof Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Proof Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
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
                    <label className="block text-sm font-medium mb-2">
                      Proof ID
                    </label>
                    <Input
                      value={formData.proofId}
                      placeholder="12345678900"
                      onChange={(e) =>
                        setFormData({ ...formData, proofId: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Pricing Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Price per Person (₹)
                    </label>
                    <Input
                      value={formData.pricePerPerson}
                      placeholder="0"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricePerPerson: e.target.value.replace(/[^0-9.]/g, ""),
                        })
                      }
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Total Amount (₹)
                    </label>
                    <Input
                      value={totalAmount ? totalAmount.toString() : "0"}
                      placeholder="0"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Paid Amount (₹)
                    </label>
                    <Input
                      value={formData.paidAmount}
                      placeholder="₹0"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paidAmount: e.target.value.replace(/[^0-9.]/g, ""),
                        })
                      }
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Balance Amount (₹)
                    </label>
                    <Input
                      value={balanceAmountComputed ? balanceAmountComputed.toString() : "0"}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
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
              <div className="flex flex-col gap-3 items-center mt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || loading}
                  className="w-1/2 border px-12 py-3 bg-primary hover:bg-primary/90 text-white rounded-md disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-1/2 border border-gray-300 text-gray-700 hover:bg-gray-100 text-base font-medium py-2.5 rounded-md transition-all"
                  onClick={handleBack}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookingDetails;  