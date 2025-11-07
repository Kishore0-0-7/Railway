import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Camera,
  Phone,
  MapPin,
  IdCard,
  CheckCircle,
  Crown,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Admin profile data - comprehensive fields
  const [profileData, setProfileData] = useState({
    adminName: "",
    adminId: "",
    phoneNo: "",
    address: "",
    email: "",
    joinDate: "",
    role: "Administrator",
    profileImage: "",
    // Subscription details
    subscription: {
      startDate: "",
      endDate: "",
    },
  });

  const [editData, setEditData] = useState({
    adminName: "",
    phoneNo: "",
    address: "",
    email: "",
    joinDate: "",
    subscription: {
      startDate: "",
      endDate: "",
    },
  });

  // Load admin data from localStorage on component mount
  useEffect(() => {
    const adminName = localStorage.getItem("adminName") || "#1225";
    const adminEmail = localStorage.getItem("email") || "admin@railway.com";
    const adminId = localStorage.getItem("adminId") || "ADMIN001";

    const profile = {
      adminName: adminName,
      adminId: adminId,
      phoneNo: localStorage.getItem("adminPhone") || "",
      address: localStorage.getItem("adminAddress") || "",
      email: adminEmail,
      joinDate: localStorage.getItem("adminJoinDate") || "",
      role: "Administrator",
      profileImage: localStorage.getItem("adminProfileImage") || "",
      subscription: {
        startDate: localStorage.getItem("subscriptionStart") || "23/12/2024",
        endDate: localStorage.getItem("subscriptionEnd") || "23/05/2025",
      },
    };

    setProfileData(profile);
    setEditData({
      adminName: profile.adminName,
      phoneNo: profile.phoneNo,
      address: profile.address,
      email: profile.email,
      joinDate: profile.joinDate,
      subscription: {
        startDate: profile.subscription.startDate,
        endDate: profile.subscription.endDate,
      },
    });
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      adminName: profileData.adminName,
      phoneNo: profileData.phoneNo,
      address: profileData.address,
      email: profileData.email,
      joinDate: profileData.joinDate,
      subscription: {
        startDate: profileData.subscription.startDate,
        endDate: profileData.subscription.endDate,
      },
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedProfile = {
        ...profileData,
        adminName: editData.adminName,
        phoneNo: editData.phoneNo,
        address: editData.address,
        email: editData.email,
        joinDate: editData.joinDate,
        subscription: {
          startDate: editData.subscription.startDate,
          endDate: editData.subscription.endDate,
        },
      };

      setProfileData(updatedProfile);

      // Update localStorage (excluding adminId which should never change)
      localStorage.setItem("adminName", editData.adminName);
      localStorage.setItem("adminPhone", editData.phoneNo);
      localStorage.setItem("adminAddress", editData.address);
      localStorage.setItem("email", editData.email);
      localStorage.setItem("adminJoinDate", editData.joinDate);
      localStorage.setItem(
        "subscriptionStart",
        editData.subscription.startDate
      );
      localStorage.setItem("subscriptionEnd", editData.subscription.endDate);

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingPhoto(true);

    // Create FileReader to convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target?.result as string;

      // Update profile data with new image
      setProfileData((prev) => ({
        ...prev,
        profileImage: base64Image,
      }));

      // Save to localStorage
      localStorage.setItem("adminProfileImage", base64Image);

      setUploadingPhoto(false);
      toast.success("Profile photo updated successfully!");
    };

    reader.onerror = () => {
      setUploadingPhoto(false);
      toast.error("Failed to upload image");
    };

    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setProfileData((prev) => ({
      ...prev,
      profileImage: "",
    }));
    localStorage.removeItem("adminProfileImage");
    toast.success("Profile photo removed");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header with Profile Overview */}
          <div className="mb-6 sm:mb-8">
            <Card className="bg-black text-white border-0 shadow-xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                    {/* Profile Avatar */}
                    <div className="relative group">
                      <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-white shadow-lg">
                        <AvatarImage src={profileData.profileImage} />
                        <AvatarFallback className="text-lg sm:text-2xl font-bold bg-white text-blue-600">
                          {getInitials(profileData.adminName)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Photo Upload Button */}
                      <div className="absolute -bottom-2 -right-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label htmlFor="photo-upload">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-8 h-8 rounded-full p-0 shadow-md hover:shadow-lg transition-all cursor-pointer"
                            disabled={uploadingPhoto}
                            asChild
                          >
                            <span>
                              {uploadingPhoto ? (
                                <div className="w-3 h-3 sm:w-4 sm:h-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                              ) : (
                                <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                              )}
                            </span>
                          </Button>
                        </label>
                      </div>

                      {/* Remove Photo Button (appears on hover if photo exists) */}
                      {profileData.profileImage && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    {/* Profile Info */}
                    <div className="text-center sm:text-left">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                        {profileData.adminName || "Admin User"}
                      </h1>
                      <p className="text-blue-100 mb-3 flex items-center justify-center sm:justify-start">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="text-sm sm:text-base break-all">
                          {profileData.email}
                        </span>
                      </p>
                      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                        <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                          <Crown className="w-3 h-3 mr-1" />
                          {profileData.role}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-white/10 text-white border-white/30"
                        >
                          <IdCard className="w-3 h-3 mr-1" />
                          ID: {profileData.adminId}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    {!isEditing ? (
                      <Button
                        onClick={handleEdit}
                        variant="secondary"
                        className="shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        <Button
                          onClick={handleSave}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="secondary"
                          className="shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Profile Information - Left Column */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-4 sm:p-6">
                  <CardTitle className="flex items-center text-gray-800 text-lg sm:text-xl">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Admin Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="adminName"
                        className="flex items-center text-sm font-medium text-gray-700"
                      >
                        <User className="w-4 h-4 mr-2 text-blue-500" />
                        Admin Name
                      </Label>
                      {isEditing ? (
                        <Input
                          id="adminName"
                          value={editData.adminName}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              adminName: e.target.value,
                            })
                          }
                          placeholder="Enter admin name"
                          className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md border flex items-center">
                          <span className="text-gray-900">
                            {profileData.adminName || "Not set"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Admin ID - Always Read-only */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="adminId"
                        className="flex flex-wrap items-center text-sm font-medium text-gray-700 gap-1"
                      >
                        <div className="flex items-center">
                          <IdCard className="w-4 h-4 mr-2 text-orange-500" />
                          Admin ID
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Protected
                        </Badge>
                      </Label>
                      <div className="mt-2 p-3 bg-gray-100 rounded-md border border-gray-200 flex items-center break-all">
                        <Shield className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">
                          {profileData.adminId}
                        </span>
                      </div>
                    </div>

                    {/* Phone No */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="phoneNo"
                        className="flex items-center text-sm font-medium text-gray-700"
                      >
                        <Phone className="w-4 h-4 mr-2 text-green-500" />
                        Phone Number
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phoneNo"
                          value={editData.phoneNo}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              phoneNo: e.target.value,
                            })
                          }
                          placeholder="Enter phone number"
                          className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md border flex items-center">
                          <span className="text-gray-900">
                            {profileData.phoneNo || "Not provided"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="address"
                        className="flex items-center text-sm font-medium text-gray-700"
                      >
                        <MapPin className="w-4 h-4 mr-2 text-red-500" />
                        Address
                      </Label>
                      {isEditing ? (
                        <Input
                          id="address"
                          value={editData.address}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              address: e.target.value,
                            })
                          }
                          placeholder="Enter address"
                          className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md border flex items-center">
                          <span className="text-gray-900">
                            {profileData.address || "Not provided"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="flex items-center text-sm font-medium text-gray-700"
                      >
                        <Mail className="w-4 h-4 mr-2 text-purple-500" />
                        Email Address
                      </Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editData.email}
                          onChange={(e) =>
                            setEditData({ ...editData, email: e.target.value })
                          }
                          placeholder="Enter email address"
                          className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md border flex items-center">
                          <span className="text-gray-900">
                            {profileData.email}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Join Date */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="joinDate"
                        className="flex items-center text-sm font-medium text-gray-700"
                      >
                        <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                        Join Date
                      </Label>
                      {isEditing ? (
                        <Input
                          id="joinDate"
                          type="date"
                          value={editData.joinDate}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              joinDate: e.target.value,
                            })
                          }
                          className="mt-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md border flex items-center">
                          <span className="text-gray-900">
                            {profileData.joinDate || "Not set"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Subscription Card */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b p-4 sm:p-6">
                  <CardTitle className="flex items-center text-gray-800 text-lg sm:text-xl">
                    <Calendar className="w-5 h-5 mr-2 text-green-600" />
                    Subscription
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Your subscription details and status
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* Subscription Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-semibold text-green-800">
                          Active Subscription
                        </span>
                      </div>
                      <Badge className="bg-green-600 text-white">Premium</Badge>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">
                        Start Date
                      </Label>
                      {isEditing ? (
                        <Input
                          value={editData.subscription.startDate}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              subscription: {
                                ...editData.subscription,
                                startDate: e.target.value,
                              },
                            })
                          }
                          placeholder="DD/MM/YYYY"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md border">
                          <span className="text-gray-900">
                            {profileData.subscription.startDate}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">
                        End Date
                      </Label>
                      {isEditing ? (
                        <Input
                          value={editData.subscription.endDate}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              subscription: {
                                ...editData.subscription,
                                endDate: e.target.value,
                              },
                            })
                          }
                          placeholder="DD/MM/YYYY"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md border">
                          <span className="text-gray-900">
                            {profileData.subscription.endDate}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
