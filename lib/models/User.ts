import mongoose, {
  Schema,
  Document,
  models,
} from "mongoose";

export interface IAddress {
  label: string;
  address: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface IStore {
  name: string;
  url?: string;
  logo?: string;
  favorite?: boolean;
}

export interface IUserDocumentFile {
  label: string;
  filename: string;
  url?: string;
  uploadedAt?: Date;
}

export interface IPaymentMethod {
  _id?: mongoose.Types.ObjectId;
  type: "card" | "paypal" | "wire" | string;
  details: string;
  isDefault?: boolean;
}

export interface IPushToken {
  _id?: mongoose.Types.ObjectId;
  deviceToken: string;
  platform: "ios" | "android" | "web" | string;
  createdAt?: Date;
  lastActive?: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;

  phone?: string;

  // IMPORTANT: top-level country
  country?: string;

  membership?: string;
  subscribed?: boolean;

  suiteId?: string | null;

  role?: string;

  status?: string;

  emailVerified?: boolean;
  emailVerifiedAt?: Date | null;

  trackingEmails?: boolean;

  addresses?: IAddress[];

  stores?: IStore[];

  documents?: IUserDocumentFile[];

  paymentMethods?: IPaymentMethod[];

  pushTokens?: IPushToken[];

  createdAt?: Date;
  updatedAt?: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    label: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    address2: String,

    city: String,

    state: String,

    country: String,

    postalCode: String,
  },
  {
    _id: false,
  }
);

const StoreSchema = new Schema<IStore>(
  {
    name: {
      type: String,
      required: true,
    },

    url: String,

    logo: String,

    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const UserDocumentFileSchema =
  new Schema<IUserDocumentFile>({
    label: {
      type: String,
      required: true,
    },

    filename: {
      type: String,
      required: true,
    },

    url: String,

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  });

const PaymentMethodSchema =
  new Schema<IPaymentMethod>({
    type: {
      type: String,
      required: true,
      enum: [
        "card",
        "paypal",
        "wire",
      ],
      default: "card",
    },

    details: {
      type: String,
      required: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  });

const PushTokenSchema =
  new Schema<IPushToken>({
    deviceToken: {
      type: String,
      required: true,
    },

    platform: {
      type: String,
      required: true,
      enum: [
        "ios",
        "android",
        "web",
      ],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },
  });

const UserSchema =
  new Schema<IUser>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      password: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        trim: true,
      },

      membership: {
        type: String,
        default: "Free",
      },

      subscribed: {
        type: Boolean,
        default: false,
      },

      suiteId: {
        type: String,
        default: null,
        unique: true,
        sparse: true,
      },

      role: {
        type: String,
        default: "user",
      },

      status: {
        type: String,
        default: "Active",
      },

      emailVerified: {
        type: Boolean,
        default: false,
      },

      emailVerifiedAt: {
        type: Date,
        default: null,
      },

      addresses: {
        type: [AddressSchema],
        default: [],
      },

      stores: {
        type: [StoreSchema],
        default: [],
      },

      documents: {
        type: [UserDocumentFileSchema],
        default: [],
      },

      paymentMethods: {
        type: [PaymentMethodSchema],
        default: [],
      },

      pushTokens: {
        type: [PushTokenSchema],
        default: [],
      },

      trackingEmails: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

/*
  Strip sensitive/internal fields
  when returning user objects as JSON.
*/

UserSchema.set(
  "toJSON",
  {
    transform:
      (_doc, ret) => {
        const {
          password,
          __v,
          ...rest
        } = ret;

        return rest;
      },
  }
);

export default (
  models.User ||
  mongoose.model<IUser>(
    "User",
    UserSchema
  )
);