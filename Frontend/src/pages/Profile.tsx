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
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Admin profile data
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    adminId: "",
    role: "Administrator",
    joinDate: "",
    lastLogin: "",
    profileImage: "",
  });

  const [editData, setEditData] = useState({
    fullName: "",
    email: "",
  });

  // Load admin data from localStorage on component mount
  useEffect(() => {
    const adminName = localStorage.getItem("adminName") || "Admin User";
    const adminEmail = localStorage.getItem("email") || "admin@railway.com";
    const adminId = localStorage.getItem("adminId") || "ADMIN001";

    const profile = {
      fullName: adminName,
      email: adminEmail,
      adminId: adminId,
      role: "Administrator",
      joinDate: "January 2024", // You can make this dynamic
      lastLogin: new Date().toLocaleDateString(),
      profileImage: "",
    };

    setProfileData(profile);
    setEditData({
      fullName: profile.fullName,
      email: profile.email,
    });
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      fullName: profileData.fullName,
      email: profileData.email,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedProfile = {
        ...profileData,
        fullName: editData.fullName,
        email: editData.email,
      };

      setProfileData(updatedProfile);

      // Update localStorage
      localStorage.setItem("adminName", editData.fullName);
      localStorage.setItem("email", editData.email);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-2">
                Manage your account information
              </p>
            </div>
          </div>

          {/* Profile Overview Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profileData.profileImage} />
                    <AvatarFallback className="text-xl font-bold bg-blue-100 text-blue-700">
                      {getInitials(profileData.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">
                    {profileData.fullName}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {profileData.email}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {profileData.role}
                    </Badge>
                    <Badge variant="outline">ID: {profileData.adminId}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button onClick={handleEdit} variant="outline">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Saving..." : "Save"}
                      </Button>
                      <Button onClick={handleCancel} variant="outline">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="fullName"
                      value={editData.fullName}
                      onChange={(e) =>
                        setEditData({ ...editData, fullName: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {profileData.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {profileData.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Admin ID</Label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {profileData.adminId}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {profileData.role}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Join Date</Label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {profileData.joinDate}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Last Login</Label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {profileData.lastLogin}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-gray-600">
                    Last changed 30 days ago
                  </p>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
