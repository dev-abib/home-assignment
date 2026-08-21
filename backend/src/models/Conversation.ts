import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  type: "direct" | "group";
  name?: string;
  createdBy?: mongoose.Types.ObjectId;
  admins: mongoose.Types.ObjectId[];
  participants: mongoose.Types.ObjectId[];
  lastMessage?: {
    text?: string;
    sender?: mongoose.Types.ObjectId;
    createdAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    type: { type: String, enum: ["direct", "group"], default: "direct" },
    name: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage: {
      text: { type: String },
      sender: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date },
    },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model<IConversation>("Conversation", ConversationSchema);
