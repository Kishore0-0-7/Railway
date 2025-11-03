import { useEffect, useState } from "react";
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
  status: string;
  worker_name?: string;
  admin_name?: string;
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

  const handleSubmitRedirect = () => {
    if (booking?.booking_id) {
      navigate(`/submit-booking/${booking.booking_id}`);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

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
                    value={booking.booking_id || ""}
                    placeholder="e.g. #1225"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Guest Name
                  </label>
                  <Input
                    value={booking.guest_name || ""}
                    placeholder="Enter full name"
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
                    value={booking.phone_number || ""}
                    placeholder="+91 902 543 3001"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Persons
                  </label>
                  <Input
                    value={booking.number_of_persons?.toString() || ""}
                    placeholder="Enter number"
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
                    value={booking.booking_type || ""}
                    placeholder="Sleeper"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Total Hours
                  </label>
                  <Input
                    value={booking.total_hours?.toString() || ""}
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
                      value={formatDate(booking.booking_date)}
                      type="date"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      In Time
                    </label>
                    <Input
                      value={formatTime(booking.in_time)}
                      type="time"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Out Time
                    </label>
                    <Input
                      value={formatTime(booking.out_time)}
                      type="time"
                      readOnly
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
                    <Input
                      value={booking.proof_type || ""}
                      placeholder="Aadhar"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Proof ID
                    </label>
                    <Input
                      value={booking.proof_id || ""}
                      placeholder="12345678900"
                      readOnly
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
                      value={booking.price_per_person?.toString() || "0"}
                      placeholder="0"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Total Amount (₹)
                    </label>
                    <Input
                      value={booking.total_amount?.toString() || "0"}
                      placeholder="0"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Paid Amount (₹)
                    </label>
                    <Input
                      value={booking.paid_amount?.toString() || "0"}
                      placeholder="₹0"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 items-center mt-6">
                <Button
                  type="button"
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium py-2.5 rounded-md transition-all"
                  onClick={handleSubmitRedirect}
                >
                  Submit
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
