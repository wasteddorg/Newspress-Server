// src/app.ts
import express7 from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "STUDENT"
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "ACTIVE"
      }
    }
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId }
          });
          if (user && user.status === "BLOCKED") {
            throw new Error("BANNED_USER");
          }
        }
      }
    }
  }
});

// src/modules/tutor/tutor.routes.ts
import express from "express";

// src/middleware/auth.ts
import { fromNodeHeaders } from "better-auth/node";
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized! Please login first."
        });
      }
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { status: true }
      });
      if (!currentUser || currentUser.status !== "ACTIVE") {
        return res.status(403).json({
          success: false,
          message: "Your account is deactivated or blocked. Please contact admin."
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified
      };
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden! Only ${roles.join(", ")} can access this resource.`
        });
      }
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during authentication"
      });
    }
  };
};
var auth_default = auth2;

// src/modules/tutor/tutor.service.ts
var createOrUpdateProfile = async (userId, data) => {
  return await prisma.tutorProfile.upsert({
    where: { userId },
    update: {
      bio: data.bio,
      pricePerHour: parseFloat(data.pricePerHour),
      experience: parseInt(data.experience),
      categories: {
        set: [],
        connect: [{ id: data.categoryId }]
      }
    },
    create: {
      userId,
      bio: data.bio,
      pricePerHour: parseFloat(data.pricePerHour),
      experience: parseInt(data.experience),
      categories: {
        connect: [{ id: data.categoryId }]
      }
    }
  });
};
var updateAvailability = async (userId, slots) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId }
  });
  if (!tutor) throw new Error("Tutor profile not found!");
  return await prisma.$transaction(async (tx) => {
    await tx.availabilitySlot.deleteMany({
      where: {
        tutorId: tutor.id,
        isBooked: false
      }
    });
    const allGeneratedSlots = [];
    slots.forEach((slot) => {
      let currentStart = new Date(slot.startTime);
      const finalEnd = new Date(slot.endTime);
      while (currentStart < finalEnd) {
        const nextHour = new Date(currentStart);
        nextHour.setHours(nextHour.getHours() + 1);
        if (nextHour <= finalEnd) {
          allGeneratedSlots.push({
            tutorId: tutor.id,
            startTime: new Date(currentStart),
            endTime: new Date(nextHour)
          });
        }
        currentStart = new Date(nextHour);
      }
    });
    if (allGeneratedSlots.length > 0) {
      return await tx.availabilitySlot.createMany({
        data: allGeneratedSlots
      });
    }
    return { count: 0 };
  });
};
var getAllTutors = async (query) => {
  const { searchTerm, minPrice, maxPrice, sortBy, sortOrder, categoryId } = query;
  const where = {};
  if (categoryId) {
    where.categories = {
      some: { id: categoryId }
    };
  }
  if (searchTerm) {
    where.OR = [
      { user: { name: { contains: searchTerm, mode: "insensitive" } } },
      { bio: { contains: searchTerm, mode: "insensitive" } }
    ];
  }
  if (minPrice || maxPrice) {
    where.pricePerHour = {
      gte: minPrice ? parseFloat(minPrice) : void 0,
      lte: maxPrice ? parseFloat(maxPrice) : void 0
    };
  }
  return await prisma.tutorProfile.findMany({
    where,
    include: {
      user: { select: { name: true, image: true, email: true } },
      categories: true,
      bookings: true,
      slots: {
        where: {
          isBooked: false
        }
      },
      reviews: {
        include: {
          student: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    },
    orderBy: sortBy ? { [sortBy]: sortOrder || "desc" } : { averageRating: "desc" }
  });
};
var getMyStudents = async (userId) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId }
  });
  if (!tutor) {
    return [];
  }
  const result = await prisma.booking.findMany({
    where: {
      tutorId: tutor.id,
      status: {
        not: "CANCELLED"
        // Jader status CANCELLED na, sudhu tader e dekhabe
      }
    },
    include: {
      student: {
        select: {
          name: true,
          email: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return result;
};
var TutorService = { createOrUpdateProfile, getMyStudents, updateAvailability, getAllTutors };

// src/modules/tutor/tutor.controller.ts
var updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const result = await TutorService.createOrUpdateProfile(userId, req.body);
    res.status(200).json({
      success: true,
      message: "Tutor profile processed successfully!",
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var updateAvailability2 = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await TutorService.updateAvailability(userId, req.body.slots);
    res.status(200).json({ success: true, message: "Slots added!", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var getAllTutors2 = async (req, res) => {
  try {
    const result = await TutorService.getAllTutors(req.query);
    res.status(200).json({ success: true, message: "Tutors fetched!", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var getMyStudents2 = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const result = await TutorService.getMyStudents(userId);
    res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var TutorController = { updateProfile, getMyStudents: getMyStudents2, updateAvailability: updateAvailability2, getAllTutors: getAllTutors2 };

// src/modules/tutor/tutor.routes.ts
var router = express.Router();
router.put(
  "/profile",
  auth_default("TUTOR" /* TUTOR */),
  TutorController.updateProfile
);
router.put(
  "/availability",
  auth_default("TUTOR" /* TUTOR */),
  TutorController.updateAvailability
);
router.get(
  "/",
  TutorController.getAllTutors
);
router.get(
  "/my-students",
  auth_default("TUTOR" /* TUTOR */),
  TutorController.getMyStudents
);
var TutorRoutes = router;

// src/modules/booking/booking.routes.ts
import express2 from "express";

// src/modules/booking/booking.service.ts
var createBooking = async (studentId, tutorId, slotId) => {
  return await prisma.$transaction(async (tx) => {
    const slot = await tx.availabilitySlot.findUnique({
      where: { id: slotId }
    });
    if (!slot) throw new Error("This slot does not exist!");
    if (slot.isBooked) throw new Error("This slot is already taken!");
    const existingBooking = await tx.booking.findFirst({
      where: {
        studentId,
        slotId,
        status: { not: "CANCELLED" }
      }
    });
    if (existingBooking) throw new Error("You already have an active booking for this slot!");
    const booking = await tx.booking.create({
      data: {
        studentId,
        tutorId,
        slotId,
        status: "CONFIRMED"
      }
    });
    await tx.availabilitySlot.update({
      where: { id: slotId },
      data: { isBooked: true }
    });
    return booking;
  });
};
var getMyBookings = async (userId, role) => {
  if (role === "TUTOR") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId }
    });
    if (!tutorProfile) return [];
    return await prisma.booking.findMany({
      where: { tutorId: tutorProfile.id },
      include: {
        student: { select: { name: true, image: true, email: true } },
        slot: true
      },
      orderBy: { createdAt: "desc" }
    });
  } else {
    return await prisma.booking.findMany({
      where: {
        studentId: userId,
        status: {
          not: "CANCELLED"
        }
      },
      include: {
        tutor: { include: { user: { select: { name: true, image: true } } } },
        slot: true
      },
      orderBy: { createdAt: "desc" }
    });
  }
};
var getBookingById = async (id) => {
  return await prisma.booking.findUnique({
    where: { id },
    include: {
      tutor: { include: { user: { select: { name: true, image: true, email: true } } } },
      student: { select: { name: true, email: true } },
      slot: true
    }
  });
};
var updateBookingStatus = async (bookingId, userId, status) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { tutor: true }
  });
  if (!booking) throw new Error("Booking not found!");
  if (booking.tutor.userId !== userId && booking.studentId !== userId) {
    throw new Error("You are not authorized to update this booking!");
  }
  return await prisma.$transaction(async (tx) => {
    const updatedBooking = await tx.booking.update({
      where: { id: bookingId },
      data: { status }
    });
    if (status === "CANCELLED") {
      await tx.availabilitySlot.update({
        where: { id: booking.slotId },
        data: { isBooked: false }
      });
    }
    return updatedBooking;
  });
};
var BookingService = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getBookingById
};

// src/modules/booking/booking.controller.ts
var createBooking2 = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { tutorId, slotId } = req.body;
    const result = await BookingService.createBooking(studentId, tutorId, slotId);
    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully!",
      data: result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var getMyBookings2 = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const result = await BookingService.getMyBookings(userId, role);
    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var getBookingById2 = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await BookingService.getBookingById(id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Booking not found!" });
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var updateBookingStatus2 = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const result = await BookingService.updateBookingStatus(id, userId, status);
    res.status(200).json({
      success: true,
      message: `Booking has been ${status.toLowerCase()} successfully!`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var BookingController = { createBooking: createBooking2, getMyBookings: getMyBookings2, updateBookingStatus: updateBookingStatus2, getBookingById: getBookingById2 };

// src/modules/booking/booking.routes.ts
var router2 = express2.Router();
router2.post("/", auth_default("STUDENT" /* STUDENT */), BookingController.createBooking);
router2.get("/my-bookings", auth_default("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */), BookingController.getMyBookings);
router2.get("/:id", auth_default("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */), BookingController.getBookingById);
router2.patch("/:id/status", auth_default("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */), BookingController.updateBookingStatus);
var BookingRoutes = router2;

// src/modules/review/review.routes.ts
import express3 from "express";

// src/modules/review/review.service.ts
var createReview = async (studentId, tutorId, bookingId, rating, comment) => {
  return await prisma.$transaction(async (tx) => {
    const existingReview = await tx.review.findUnique({
      where: { bookingId }
    });
    if (existingReview) {
      throw new Error("You have already submitted a review for this booking!");
    }
    const booking = await tx.booking.findUnique({
      where: { id: bookingId }
    });
    if (!booking) {
      throw new Error(`Invalid Booking ID: ${bookingId}. Session not found.`);
    }
    const review = await tx.review.create({
      data: {
        studentId: booking.studentId,
        tutorId: booking.tutorId,
        bookingId,
        rating,
        comment
      }
    });
    const avgData = await tx.review.aggregate({
      where: { tutorId: booking.tutorId },
      _avg: { rating: true }
    });
    await tx.tutorProfile.update({
      where: { id: booking.tutorId },
      data: { averageRating: avgData._avg.rating || 0 }
    });
    return review;
  });
};
var ReviewService = { createReview };

// src/modules/review/review.controller.ts
var createReview2 = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { tutorId, bookingId, rating, comment } = req.body;
    const result = await ReviewService.createReview(
      studentId,
      tutorId,
      bookingId,
      rating,
      comment
    );
    res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var ReviewController = { createReview: createReview2 };

// src/modules/review/review.routes.ts
var router3 = express3.Router();
router3.post("/", auth_default("STUDENT" /* STUDENT */), ReviewController.createReview);
var ReviewRoutes = router3;

// src/modules/category/category.routes.ts
import express4 from "express";

// src/modules/category/category.service.ts
var createCategory = async (subjectName) => {
  const isExist = await prisma.category.findUnique({
    where: { name: subjectName }
  });
  if (isExist) {
    throw new Error(`Subject '${subjectName}' already exists.`);
  }
  return await prisma.category.create({
    data: { name: subjectName }
  });
};
var getAllCategories = async () => {
  return await prisma.category.findMany({
    include: {
      tutors: {
        select: {
          id: true
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  });
};
var updateCategoryInDB = async (id, name) => {
  return await prisma.category.update({
    where: { id },
    data: { name }
  });
};
var deleteCategoryFromDB = async (id) => {
  return await prisma.category.delete({
    where: { id }
  });
};
var CategoryService = {
  createCategory,
  getAllCategories,
  updateCategoryInDB,
  deleteCategoryFromDB
};

// src/modules/category/category.controller.ts
var createCategory2 = async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject || subject.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Invalid Input: Subject name is required."
      });
    }
    const result = await CategoryService.createCategory(subject);
    return res.status(201).json({
      success: true,
      message: "Success: New subject category has been added.",
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create category."
    });
  }
};
var getAllCategories2 = async (req, res) => {
  try {
    const result = await CategoryService.getAllCategories();
    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully!",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};
var editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject } = req.body;
    if (!subject) {
      return res.status(400).json({ success: false, message: "Please provide a subject name!" });
    }
    const result = await CategoryService.updateCategoryInDB(id, subject);
    res.status(200).json({
      success: true,
      message: "Category updated successfully!",
      data: result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var removeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await CategoryService.deleteCategoryFromDB(id);
    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var CategoryController = {
  createCategory: createCategory2,
  getAllCategories: getAllCategories2,
  editCategory,
  removeCategory
};

// src/modules/category/category.routes.ts
var router4 = express4.Router();
router4.post(
  "/create-category",
  auth_default("ADMIN" /* ADMIN */),
  CategoryController.createCategory
);
router4.get(
  "/",
  // auth(UserRole.ADMIN),
  CategoryController.getAllCategories
);
router4.patch(
  "/categories/:id",
  auth_default("ADMIN" /* ADMIN */),
  CategoryController.editCategory
);
router4.delete(
  "/categories/:id",
  auth_default("ADMIN" /* ADMIN */),
  CategoryController.removeCategory
);
var CategoryRoutes = router4;

// src/modules/admin/admin.routes.ts
import express5 from "express";

// src/modules/admin/admin.service.ts
var getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      status: true,
      createdAt: true,
      tutorProfile: {
        include: {
          categories: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};
var toggleUserStatus = async (userId, status) => {
  return await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        status
      }
    });
    if (status === "BLOCKED" || status === "SUSPENDED") {
      await tx.session.deleteMany({
        where: { userId }
      });
    }
    return updatedUser;
  });
};
var getAllBookings = async () => {
  return await prisma.booking.findMany({
    include: {
      student: {
        select: {
          name: true,
          email: true,
          image: true
        }
      },
      tutor: {
        select: {
          user: {
            select: {
              name: true
            }
          }
        }
      },
      slot: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};
var updateUserRoleInDB = async (userId, role) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
};
var createCategoryInDB = async (name) => {
  return await prisma.category.create({
    data: { name }
  });
};
var getAllCategoriesFromDB = async () => {
  return await prisma.category.findMany({
    include: {
      _count: {
        select: { tutors: true }
      }
    },
    orderBy: { name: "asc" }
  });
};
var AdminService = {
  getAllUsers,
  toggleUserStatus,
  updateUserRoleInDB,
  getAllBookings,
  createCategoryInDB,
  getAllCategoriesFromDB
};

// src/modules/admin/admin.controller.ts
var getAllUsers2 = async (req, res) => {
  try {
    const result = await AdminService.getAllUsers();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await AdminService.toggleUserStatus(id, status);
    res.status(200).json({
      success: true,
      message: `User is now ${status}`,
      data: result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const result = await AdminService.updateUserRoleInDB(id, role);
    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var getAllBookings2 = async (req, res) => {
  try {
    const result = await AdminService.getAllBookings();
    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No bookings found in the system at the moment.",
        data: []
      });
    }
    res.status(200).json({
      success: true,
      message: "All bookings retrieved successfully for admin.",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching bookings.",
      error: error.message
    });
  }
};
var getCategories = async (req, res) => {
  try {
    const result = await AdminService.getAllCategoriesFromDB();
    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const result = await AdminService.createCategoryInDB(name);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var AdminController = {
  getAllUsers: getAllUsers2,
  updateUserStatus,
  updateUserRole,
  getAllBookings: getAllBookings2,
  getCategories,
  addCategory
};

// src/modules/admin/admin.routes.ts
var router5 = express5.Router();
router5.get(
  "/users",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.getAllUsers
);
router5.patch(
  "/users/:id/status",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.updateUserStatus
);
router5.patch(
  "/users/:id/role",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.updateUserRole
);
router5.get(
  "/bookings",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.getAllBookings
);
router5.get(
  "/categories",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.getCategories
);
router5.post(
  "/categories",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.addCategory
);
var AdminRoutes = router5;

// src/modules/stats/stats.routes.ts
import express6 from "express";

// src/modules/stats/stats.service.ts
var getStudentStats = async (studentId) => {
  const [totalBookings, pendingBookings, completedBookings] = await Promise.all([
    prisma.booking.count({ where: { studentId } }),
    prisma.booking.count({ where: { studentId, status: "PENDING" } }),
    prisma.booking.count({ where: { studentId, status: "COMPLETED" } })
  ]);
  return { totalBookings, pendingBookings, completedBookings };
};
var getTutorStats = async (tutorUserId) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId: tutorUserId },
    select: { id: true, averageRating: true, experience: true }
  });
  if (!tutorProfile) {
    return { totalSessions: 0, averageRating: 0, experience: 0 };
  }
  const totalSessions = await prisma.booking.count({
    where: {
      tutorId: tutorProfile.id,
      status: "CONFIRMED"
    }
  });
  return {
    totalSessions,
    averageRating: tutorProfile.averageRating || 0,
    experience: tutorProfile.experience || 0
  };
};
var StatsService = {
  getStudentStats,
  getTutorStats
};

// src/modules/stats/stats.controller.ts
var getStudentStats2 = async (req, res) => {
  try {
    const { id } = req.user;
    const result = await StatsService.getStudentStats(id);
    res.status(200).json({
      success: true,
      message: "Student statistics retrieved successfully!",
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var getTutorStats2 = async (req, res) => {
  try {
    console.log("User from request:", req.user);
    const { id } = req.user;
    const result = await StatsService.getTutorStats(id);
    res.status(200).json({
      success: true,
      message: "Tutor statistics retrieved successfully!",
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var StatsController = {
  getStudentStats: getStudentStats2,
  getTutorStats: getTutorStats2
};

// src/modules/stats/stats.routes.ts
var router6 = express6.Router();
router6.get(
  "/student-stats",
  auth_default("STUDENT" /* STUDENT */),
  StatsController.getStudentStats
);
router6.get(
  "/tutor-stats",
  auth_default("TUTOR" /* TUTOR */),
  StatsController.getTutorStats
);
var StatsRoutes = router6;

// src/app.ts
var app = express7();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express7.json());
app.all("/api/auth/*", (req, res) => {
  return toNodeHandler(auth)(req, res);
});
app.use("/api/tutor", TutorRoutes);
app.use("/api/bookings", BookingRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/categories", CategoryRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/stats", StatsRoutes);
app.get("/", (req, res) => {
  res.send("Skill Bridge is running ...");
});
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
