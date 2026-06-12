"use client";
import { DoctorFilters } from "@/lib/type";
import { useDoctorStore } from "@/store/doctorStore";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Header } from "../landing/Header";
import { FilterIcon, MapPin, Search, SearchIcon, Star, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cities, healthcareCategories, specializations } from "@/lib/constant";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";

const DoctorListPage = () => {
  const searchParams = useSearchParams();
  const categoryParams = searchParams.get("category");

  const { doctors, loading, fetchDoctors } = useDoctorStore();
  const [filters, setFilters] = useState<DoctorFilters>({
    search: "",
    specialization: "",
    category: categoryParams || "",
    city: "",
    sortBy: "experience",
    sortOrder: "desc",
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDoctors(filters);
  }, [fetchDoctors, filters]);

  const handleFilterChange = (key: keyof DoctorFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const CLearFilters = () => {
    setFilters({
      search: "",
      specialization: "",
      category: categoryParams || "",
      city: "",
      sortBy: "experience",
      sortOrder: "desc",
    });
  };

  const activeFilterCount = Object.values(filters).filter(
    (value) => value && value !== "experience" && value !== "desc",
  ).length;
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header />
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Choose your doctor
              </h1>
              <p className="text-gray-600 mt-1">
                Find the perfect HealthCare provider for your need
              </p>
            </div>
          </div>
          <div className="flex gap-4 mb-6 ">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/9 transform translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search doctors by name, specialization or condition..."
                className="pl-10 h-12 text-base"
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="h-12 px-4"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-red-300 text-red-800"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Browse by Category
            </h3>
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
              <Button
                variant={!filters.category ? "default" : "outline"}
                className="flex shrink-0 rounded-full"
                onClick={() => handleFilterChange("category", "")}
              >
                All Categories
              </Button>
              {healthcareCategories.map((cat) => (
                <Button
                  className="flex shrink-0 rounded-full whitespace-nowrap"
                  key={cat.id}
                  variant={
                    filters.category === cat.title ? "default" : "outline"
                  }
                  onClick={() => handleFilterChange("category", cat.title)}
                >
                  <div
                    className={`w-6 h-6 ${cat.color} rounded-2xl flex items-center justify-center group-hover:shadow-xl transition-all duration-200`}
                  >
                    <svg
                      className="h-6 w-6 text-white "
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={cat.icon} />
                    </svg>
                  </div>
                  {cat.title}
                </Button>
              ))}
            </div>
          </div>

          {showFilters && (
            <Card className="p-4 mb-4 bg-gray-50">
              <div className="flex items-center justify-between mbb-4">
                <h3 className="font-semibold">Advanced Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Specialization
                  </Label>
                  <Select
                    value={filters.specialization || ""}
                    onValueChange={(value) =>
                      handleFilterChange("specialization", value ?? "")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All specialization"></SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialization</SelectItem>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Location
                  </Label>
                  <Select
                    value={filters.city || ""}
                    onValueChange={(value) => handleFilterChange("city", value ?? "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All locations"></SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Sort by
                  </Label>
                  <Select
                    value={filters.sortBy || ""}
                    onValueChange={(value) =>
                      handleFilterChange("sortBy", value ?? "")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue></SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="experience">Experience</SelectItem>
                      <SelectItem value="fees">Consultation Fees</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="createAt">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={CLearFilters}
                    className="w-full"
                  >
                    Clear all filters
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4 text-sm text-gray-600">
          {loading ? "Searching" : `${doctors.length} doctor found`}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-plus">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto"></div>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : doctors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card
                key={doctor._id}
                className="hover:shadow-xl transition-all duration-300 bg-white border-0 shadow-md h-full"
              >
                <CardContent className="p-6 flex-col h-full">
                  <div className="text-center mb-4">
                    <Avatar className="w-20 h-20 mx-auto mb-3">
                      <AvatarImage
                        src={doctor.profileImage}
                        alt={doctor.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-red-100 to-red-200 text-red-700 text-xl font-bold">
                        {doctor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-bold text-red-700 mb-1">
                      {doctor.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">
                      {doctor.specialization}
                    </p>
                    <p className="text-gray-500 text-xs mb-2">
                      {doctor.experience} years experience
                    </p>
                    <div className="flex items-center justify-center space-x-1 mb-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4 fill-orange-400 text-orange-400"
                          />
                        ))}
                      </div>
                      <span className="font-bold">5.0</span>
                      <span className="text-gray-500 text-xs">(620)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 justify-center mb-4">
                    {(Array.isArray(doctor.category)
                      ? doctor.category.flatMap((cat: string) =>
                          typeof cat === "string" ? cat.split(",") : [],
                        )
                      : []
                    )
                      .slice(0, 2)
                      .map((category: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-red-50 text-red-700 border-red-200 text-xs"
                        >
                          {category.trim()}
                        </Badge>
                      ))}

                    <Badge
                      variant="secondary"
                      className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4 text-center">
                    <div className="flex items-center justify-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {doctor.hospitalInfo.city}
                      </span>
                    </div>

                    <div className="flex justify-center items-center gap-2 text-center">
                      <p className="text-gray-600 text-md font-semibold">
                        Consultation Fees:
                      </p>
                      <p className="font-bold text-green-600 text-lg">
                        ₹{doctor.fees}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Link
                      href={`/patient/booking/${doctor._id}`}
                      className="block"
                    >
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg p-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all">
                        Book Appointment
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-gray-500 mb-4">
              <Search className="w-16 h-16 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Doctors Found
              </h3>
              <p className="text-gray-500 mb-4">
                Try ajusting your filters or search critegia
              </p>
              <Button onClick={CLearFilters} className="w-full p-2">
                Clear Filter
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DoctorListPage;
