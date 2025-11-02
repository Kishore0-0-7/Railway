import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  booking_status: string;
}

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetailsData | null>(null);
  const [loading, setLoading] = useState(false);

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

  const balanceAmount = useMemo(() => {
    if (!booking) return 0;
    const balance = (booking.total_amount || 0) - (booking.paid_amount || 0);
    return Math.max(balance, 0);
  }, [booking]);

  const handleBack = () => navigate(-1);

  return (
    <div className="min-h-screen bg-muted">
      <Navigation />
      <main className="p-6">
        <div className="bg-black text-white rounded-t-lg p-6 mb-0">
          <h1 className="text-2xl font-bold">Booking Details</h1>
          <p className="text-gray-300">Information of the booking</p>
        </div>

        <div className="max-w-9xl mx-auto bg-white border border-green-500 rounded-b-lg shadow-sm p-8">
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
            <div className="space-y-8">
              {/* Booking Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Booking ID
                  </label>
                  <Input
                    placeholder="e.g. #1225"
                    value={booking.booking_id || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Guest Name
                  </label>
                  <Input
                    placeholder="Enter full name"
                    value={booking.guest_name || ""}
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <Input
                    placeholder="+91 902 543 3001"
                    value={booking.phone_number || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Persons
                  </label>
                  <Input
                    placeholder="Enter number"
                    value={booking.number_of_persons?.toString() || ""}
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Booking Type
                  </label>
                  <Input
                    placeholder="Sleeper"
                    value={booking.booking_type || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Total Hours
                  </label>
                  <Input
                    placeholder="00"
                    value={booking.total_hours?.toString() || ""}
                    readOnly
                  />
                </div>
              </div>

              {/* Booking Date & Time */}
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Booking Date & Time
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date
                    </label>
                    <Input
                      value={formatDate(booking.booking_date)}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      In Time
                    </label>
                    <Input value={formatTime(booking.in_time)} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Out Time
                    </label>
                    <Input value={formatTime(booking.out_time)} readOnly />
                  </div>
                </div>
              </div>

              {/* Proof Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Proof Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {booking.proof_type || "Proof Type"}
                    </label>
                    <Input
                      value={booking.proof_type || ""}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {booking.proof_id || "Proof ID"}
                    </label>
                    <Input
                      value={booking.proof_id || ""}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Pricing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rate</label>
                    <Input
                      value={`₹ ${booking.price_per_person || 0}`}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Total Amount (₹)
                    </label>
                    <Input
                      value={`₹${booking.total_amount || 0}`}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Payment Method
                    </label>
                    <Input
                      value={booking.payment_method || ""}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookingDetails;
