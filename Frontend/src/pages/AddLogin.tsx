import { useEffect, useMemo, useState } from "react";
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
import { bookingAPI, workerAPI } from "@/services/api";
import { toast } from "sonner";
import { useScrollToTop } from "@/hooks/useScrollToTop";

interface WorkerOption {
  worker_id: string;
  full_name: string;
}

const AddLogin = () => {
  // Scroll to top on route change
  useScrollToTop();

  const [workers, setWorkers] = useState<WorkerOption[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    bookingId: "",
    workerId: "",
    guestName: "",
    phoneNumber: "",
    numberOfPersons: "",
    bookingType: "sleeper",
    totalHours: "",
    bookingDate: "",
    inTime: "",
    proofType: "aadhaar",
    proofId: "",
    pricePerPerson: "",
    paidAmount: "",
    paymentMethod: "cash",
  });

  const totalAmount = useMemo(() => {
    const persons = Number(formData.numberOfPersons) || 0;
    const hours = Number(formData.totalHours) || 0;
    const price = Number(formData.pricePerPerson) || 0;
    return persons * hours * price;
  }, [formData.numberOfPersons, formData.totalHours, formData.pricePerPerson]);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoadingWorkers(true);
        const response = await workerAPI.getAllWorkers();
        if (response.data?.workers) {
          setWorkers(response.data.workers);
        }
      } catch (error: any) {
        console.error("Error loading workers", error);
        toast.error(error.response?.data?.error || "Failed to load workers");
      } finally {
        setLoadingWorkers(false);
      }
    };

    fetchWorkers();
  }, []);

  const handleSubmit = async () => {
    const requiredFields: Array<[string, string]> = [
      [formData.bookingId, "Booking ID is required"],
      [formData.workerId, "Worker is required"],
      [formData.guestName, "Guest name is required"],
      [formData.phoneNumber, "Phone number is required"],
      [formData.numberOfPersons, "Number of persons is required"],
      [formData.totalHours, "Total hours is required"],
      [formData.bookingDate, "Booking date is required"],
      [formData.inTime, "In time is required"],
      [formData.pricePerPerson, "Price per person is required"],
    ];

    const missingField = requiredFields.find(([value]) => !value.trim());
    if (missingField) {
      toast.error(missingField[1]);
      return;
    }

    const adminId = localStorage.getItem("adminId") || "ADM001";

    const payload = {
      booking_id: formData.bookingId.trim(),
      admin_id: adminId,
      worker_id: formData.workerId,
      guest_name: formData.guestName.trim(),
      phone_number: formData.phoneNumber.trim(),
      number_of_persons: Number(formData.numberOfPersons),
      booking_type: formData.bookingType,
      total_hours: Number(formData.totalHours),
      booking_date: formData.bookingDate,
      in_time: formData.inTime,
      proof_type: formData.proofType,
      proof_id: formData.proofId.trim(),
      price_per_person: Number(formData.pricePerPerson),
      paid_amount: Number(formData.paidAmount || 0),
      payment_method: formData.paymentMethod,
    };

    try {
      setSubmitting(true);
      await bookingAPI.createBooking(payload);
      toast.success("Booking created successfully");
      handleCancel();
    } catch (error: any) {
      console.error("Error creating booking", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create booking";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      bookingId: "",
      workerId: "",
      guestName: "",
      phoneNumber: "",
      numberOfPersons: "",
      bookingType: "sleeper",
      totalHours: "",
      bookingDate: "",
      inTime: "",
      proofType: "aadhaar",
      proofId: "",
      pricePerPerson: "",
      paidAmount: "",
      paymentMethod: "cash",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="p-6">
        {/* Header */}
        <div className="bg-nav rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-nav-foreground">
            Create Booking
          </h1>
          <p className="text-nav-foreground/80">
            Capture booking details and assign a worker
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
                  placeholder="e.g. #1225"
                  value={formData.bookingId}
                  onChange={(e) =>
                    setFormData({ ...formData, bookingId: e.target.value })
                  }
                />
              </div>

              {/* Worker */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Assign Worker
                </label>
                <Select
                  value={formData.workerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, workerId: value })
                  }
                  disabled={loadingWorkers || workers.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingWorkers ? "Loading workers..." : "Select worker"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.map((worker) => (
                      <SelectItem
                        key={worker.worker_id}
                        value={worker.worker_id}
                      >
                        {worker.worker_id} — {worker.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <Input
                  placeholder="+91 902 543 3001"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
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
                />
              </div>

              {/* Booking Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Booking Type
                </label>
                <Select
                  value={formData.bookingType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, bookingType: value })
                  }
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

              {/* Total Hours */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Total Hours
                </label>
                <Input
                  placeholder="00"
                  value={formData.totalHours}
                  onChange={(e) =>
                    setFormData({ ...formData, totalHours: e.target.value })
                  }
                />
              </div>

              {/* Booking Date & Time Section */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-4">
                  Booking Date & Time
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
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
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      In Time
                    </label>
                    <Input
                      type="time"
                      value={formData.inTime}
                      onChange={(e) =>
                        setFormData({ ...formData, inTime: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Proof Information Section */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-4">Proof Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Proof Type
                    </label>
                    <Select
                      value={formData.proofType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, proofType: value })
                      }
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
                      placeholder="Enter proof number"
                      value={formData.proofId}
                      onChange={(e) =>
                        setFormData({ ...formData, proofId: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Information Section */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-4">
                  Pricing Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Price per Person (₹)
                    </label>
                    <Input
                      placeholder="0"
                      value={formData.pricePerPerson}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pricePerPerson: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Total Amount (₹)
                    </label>
                    <Input
                      placeholder="0"
                      value={totalAmount.toString()}
                      readOnly
                      className="bg-muted/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Paid Amount
                    </label>
                    <Input
                      placeholder="0"
                      value={formData.paidAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, paidAmount: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Payment Method
                </label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentMethod: value })
                  }
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

              {/* Action Buttons */}
              <div className="md:col-span-2 flex justify-center space-x-4 mt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-16 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Create Booking"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="px-16 py-3 bg-background border border-input hover:bg-muted text-foreground rounded-md font-medium"
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

export default AddLogin;
