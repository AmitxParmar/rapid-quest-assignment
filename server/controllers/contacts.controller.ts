import { Contact } from "../models/Contact";
import { User, IUser } from "../models/User";
import { Request, Response } from "express";

interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Get contact details grouped by initial letter for authenticated user.
 *
 * @route GET /api/contacts
 * @param {AuthRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @returns {Promise<Response>}
 * @description
 *   Fetches all contacts for the authenticated user, sorts them by name,
 *   and groups them by the initial letter of the name.
 */
export const getContacts = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }
    console.log(req.user.id);
    // Get contacts with populated user data
    const contacts = await Contact.find({
      userId: req.user._id,
      isBlocked: false,
    })
      .populate(
        "contactUserId",
        "waId name profilePicture status isOnline lastSeen"
      )
      .sort({ "contactUserId.name": 1 })
      .lean();

    // Transform contacts to include user data and custom nickname
    const transformedContacts = contacts.map((contact) => ({
      _id: contact._id,
      waId: (contact.contactUserId as any).waId,
      name: contact.nickname || (contact.contactUserId as any).name,
      profilePicture: (contact.contactUserId as any).profilePicture,
      status: (contact.contactUserId as any).status,
      isOnline: (contact.contactUserId as any).isOnline,
      lastSeen: (contact.contactUserId as any).lastSeen,
      nickname: contact.nickname,
    }));

    // Group contacts by the initial letter of their name
    const groupedContacts: Record<string, typeof transformedContacts> = {};

    transformedContacts.forEach((contact) => {
      // Get the first letter, uppercase, or '#' if not a letter
      let initial: string =
        contact.name && typeof contact.name === "string"
          ? contact.name.charAt(0).toUpperCase()
          : "#";
      if (!/^[A-Z]$/.test(initial)) {
        initial = "#";
      }
      if (!groupedContacts[initial]) {
        groupedContacts[initial] = [];
      }
      (groupedContacts[initial] as typeof transformedContacts).push(contact);
    });

    // Sort the keys so the response is ordered
    const sortedGroupedContacts: Record<string, typeof transformedContacts> =
      {};
    Object.keys(groupedContacts)
      .sort((a, b) => {
        if (a === "#") return 1;
        if (b === "#") return -1;
        return a.localeCompare(b);
      })
      .forEach((key) => {
        sortedGroupedContacts[key] = groupedContacts[key] ?? [];
      });

    return res.status(200).json({
      success: true,
      data: sortedGroupedContacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Add a new contact by waId
 */
export const addContact = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { waId, nickname } = req.body;

    if (!waId) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp ID is required",
      });
    }

    // Find the user to add as contact
    const normalizeWaId = (id: string) =>
      id?.startsWith("91") ? id.trim() : `91${id?.trim()}`;
    const normalizedWaId = normalizeWaId(waId);
    const contactUser = await User.findOne({
      waId: normalizedWaId,
    });
    if (!contactUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if contact already exists (use compound unique index)
    const existingContact = await Contact.findOne({
      userId: req.user._id,
      contactUserId: contactUser._id,
    });

    if (existingContact) {
      return res.status(409).json({
        success: false,
        message: "Contact already exists",
      });
    }

    // Create new contact
    const newContact = new Contact({
      userId: req.user._id,
      contactUserId: contactUser._id,
      nickname,
    });

    await newContact.save();

    // Populate and return the new contact
    const populatedContact = await Contact.findById(newContact._id)
      .populate(
        "contactUserId",
        "waId name profilePicture status isOnline lastSeen"
      )
      .lean();

    return res.status(201).json({
      success: true,
      message: "Contact added successfully",
      data: populatedContact,
    });
  } catch (error) {
    console.error("Error adding contact:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add contact",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Search for users by waId or name
 */
export const searchUsers = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Search users by waId or name (excluding current user)
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { waId: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    })
      .select("waId name profilePicture status isOnline")
      .limit(10)
      .lean();

    // Check which users are already contacts
    const existingContacts = await Contact.find({
      userId: req.user._id,
      contactUserId: { $in: users.map((u) => u._id) },
    }).lean();

    const existingContactIds = new Set(
      existingContacts.map((c) => c.contactUserId.toString())
    );

    const searchResults = users.map((user) => ({
      id: user._id,
      waId: user.waId,
      name: user.name,
      profilePicture: user.profilePicture,
      status: user.status,
      isOnline: user.isOnline,
      isContact: existingContactIds.has(user._id.toString()),
    }));

    return res.status(200).json({
      success: true,
      data: searchResults,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
