import { Schema, model, Document, Types } from 'mongoose';

export interface Destination {
  _id: Types.ObjectId;
  city: string;
  country: string;
  arrivalDate: Date;
  departureDate: Date;
  notes?: string;
}

export interface Expense {
  _id: Types.ObjectId;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: Date;
  linkedType?: 'transportation' | 'accommodation';
  linkedId?: Types.ObjectId;
  destinationId?: Types.ObjectId;
}

export interface Transportation {
  _id: Types.ObjectId;
  type: string;
  from: string;
  to: string;
  date: Date;
  departureTime?: string;
  arrivalTime?: string;
  cost: number;
  currency: string;
  notes?: string;
  destinationId?: Types.ObjectId;
}

export interface Accommodation {
  _id: Types.ObjectId;
  name: string;
  city: string;
  checkIn: Date;
  checkOut: Date;
  cost: number;
  currency: string;
  notes?: string;
  destinationId?: Types.ObjectId;
}

export interface ITrip extends Document {
  userId: Types.ObjectId;
  title: string;
  budget: number;
  currency: string;
  logo?: string;
  destinations: Destination[];
  expenses: Expense[];
  transportation: Transportation[];
  accommodation: Accommodation[];
  totalExpenses: number;
}

const destinationSchema = new Schema<Destination>(
  {
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    arrivalDate: { type: Date, required: true },
    departureDate: { type: Date, required: true },
    notes: { type: String, trim: true }
  },
  { _id: true }
);

const expenseSchema = new Schema<Expense>(
  {
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    linkedType: { type: String, enum: ['transportation', 'accommodation'], required: false },
    linkedId: { type: Schema.Types.ObjectId },
    destinationId: { type: Schema.Types.ObjectId }
  },
  { _id: true }
);

const transportationSchema = new Schema<Transportation>(
  {
    type: { type: String, required: true, trim: true },
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    departureTime: String,
    arrivalTime: String,
    cost: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    destinationId: { type: Schema.Types.ObjectId }
  },
  { _id: true }
);

const accommodationSchema = new Schema<Accommodation>(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    cost: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    destinationId: { type: Schema.Types.ObjectId }
  },
  { _id: true }
);

const tripSchema = new Schema<ITrip>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    budget: { type: Number, default: 0, min: 0 },
    currency: { type: String, required: true, trim: true },
    logo: String,
    destinations: [destinationSchema],
    expenses: [expenseSchema],
    transportation: [transportationSchema],
    accommodation: [accommodationSchema]
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tripSchema.index({ userId: 1, createdAt: -1 });
tripSchema.index({ title: 'text' });

tripSchema.virtual('totalExpenses').get(function (this: ITrip) {
  return this.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
});

tripSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    // Normalize id and hide internal fields
    const doc = ret as {
      id?: unknown;
      _id?: unknown;
      __v?: unknown;
    };

    doc.id = (doc._id as { toString?: () => string } | undefined)?.toString?.() ?? doc._id;

    if (doc._id !== undefined) {
      delete doc._id;
    }
    if (doc.__v !== undefined) {
      delete doc.__v;
    }

    return doc;
  }
});

export const Trip = model<ITrip>('Trip', tripSchema);
