import bcrypt from 'bcrypt';
import { Schema, model, Document, Model } from 'mongoose';
import { signAccessToken } from '../config/jwt';

export interface UserPreferences {
  defaultCurrency?: string;
  theme?: string;
}

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  avatar?: string;
  preferences?: UserPreferences;
  comparePassword(candidate: string): Promise<boolean>;
  generateAuthToken(): string;
}

interface UserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser, UserModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    name: {
      type: String,
      trim: true
    },
    avatar: String,
    preferences: {
      defaultCurrency: { type: String, default: 'USD' },
      theme: { type: String, default: 'light' }
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  console.log('[USER PRE-SAVE] Hook triggered - isModified(password):', this.isModified('password'));
  if (!this.isModified('password')) {
    console.log('[USER PRE-SAVE] Password not modified, skipping hash');
    return next();
  }
  console.log('[USER PRE-SAVE] Hashing password...');
  const saltRounds = 10;
  try {
    this.password = await bcrypt.hash(this.password, saltRounds);
    console.log('[USER PRE-SAVE] Password hashed successfully');
    next();
  } catch (err) {
    console.error('[USER PRE-SAVE] Error hashing password:', err instanceof Error ? err.message : String(err));
    next(err as Error);
  }
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return signAccessToken({ userId: this._id.toString() });
};

userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email }).select('+password');
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    // Normalize id and hide internal fields
    const doc = ret as {
      id?: unknown;
      _id?: unknown;
      __v?: unknown;
      password?: unknown;
    };

    doc.id = (doc._id as { toString?: () => string } | undefined)?.toString?.() ?? doc._id;

    if (doc._id !== undefined) {
      delete doc._id;
    }
    if (doc.__v !== undefined) {
      delete doc.__v;
    }
    if (doc.password !== undefined) {
      delete doc.password;
    }

    return doc;
  }
});

export const User = model<IUser, UserModel>('User', userSchema);
