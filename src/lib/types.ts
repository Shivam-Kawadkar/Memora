export type Role = "admin" | "moderator" | "member" | "viewer";

export type Profile = {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  coverColor: string;
  coverUrl: string | null; // latest memory image, used as a banner
  memberCount: number;
  myRole: Role;
};

export type FeedMemory = {
  id: string;
  imageUrl: string;
  caption: string;
  uploaderName: string;
  uploaderAvatar: string;
  createdAt: string; // pre-formatted relative time, e.g. "2 days ago"
  isMine: boolean;
  albumId: string | null;
  albumTitle: string | null;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
};

export type MemoryDetail = {
  id: string;
  groupId: string;
  imageUrl: string;
  caption: string;
  uploaderName: string;
  uploaderAvatar: string;
  createdAt: string;
  isMine: boolean;
  albumTitle: string | null;
  likeCount: number;
  likedByMe: boolean;
};

export type Comment = {
  id: string;
  body: string;
  createdAt: string; // relative
  authorName: string;
  authorAvatar: string;
  isMine: boolean;
};

export type AlbumSummary = {
  id: string;
  title: string;
  coverUrl: string | null;
  count: number;
};

export type Album = {
  id: string;
  title: string;
  groupId: string;
  createdBy: string;
};

// Minimal album reference for pickers (upload modal, move control).
export type AlbumRef = { id: string; title: string };

export type Member = {
  userId: string;
  name: string;
  avatarUrl: string;
  role: Role;
  isMe: boolean;
};

export type MyProfile = {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  email: string;
};

export const ROLE_CAN_UPLOAD: Record<Role, boolean> = {
  admin: true,
  moderator: true,
  member: true,
  viewer: false,
};

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  moderator: "Moderator",
  member: "Member",
  viewer: "Viewer",
};