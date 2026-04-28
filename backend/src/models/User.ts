import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { createJWT } from "../utils/jwt";

//define TypeScript interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  image?: mongoose.Types.ObjectId;
  createdAt: Date;

  comparePassword(candidate: string): Promise<boolean>;
  createJWT(): string;
}

//create schema
const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  image: {
    type: Schema.Types.ObjectId,
    ref: "Image",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//password hash before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//compare password method
UserSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

//create JWT method
UserSchema.methods.createJWT = function () {
  return createJWT({ userId: this._id, name: this.name, email: this.email });
};

//remove password from output
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model<IUser>("User", UserSchema);
