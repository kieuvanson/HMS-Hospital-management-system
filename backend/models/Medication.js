import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    genericName: {
      type: String,
      trim: true,
    },

    brandName: {
      type: String,
      trim: true,
    },

    activeIngredients: [
      {
        name: { type: String, required: true, trim: true },
        amount: { type: Number, min: 0 },
        unit: { type: String, trim: true, default: "mg" },
      },
    ],

    category: {
      type: String,
      trim: true,
      default: "Khac",
    },

    dosageForm: {
      type: String,
      enum: [
        "tablet",
        "capsule",
        "syrup",
        "injection",
        "cream",
        "ointment",
        "drops",
        "powder",
        "solution",
        "other",
      ],
      default: "tablet",
    },

    strength: {
      type: String,
      trim: true,
    },

    administrationRoute: {
      type: String,
      enum: ["oral", "iv", "im", "topical", "inhalation", "other"],
      default: "oral",
    },

    manufacturer: {
      type: String,
      trim: true,
    },

    countryOfOrigin: {
      type: String,
      trim: true,
    },

    registrationNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    prescriptionRequired: {
      type: Boolean,
      default: true,
    },

    // Gia thuoc theo lieu va theo hop
    pricing: {
      pricePerDose: {
        type: Number,
        required: true,
        min: 0,
      },
      dosesPerBox: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
      pricePerBox: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: "VND",
        uppercase: true,
      },
    },

    inventory: {
      stockBoxes: {
        type: Number,
        min: 0,
        default: 0,
      },
      stockDoses: {
        type: Number,
        min: 0,
        default: 0,
      },
      reorderLevelBoxes: {
        type: Number,
        min: 0,
        default: 0,
      },
      location: {
        type: String,
        trim: true,
      },
    },

    batches: [
      {
        batchNumber: { type: String, trim: true, required: true },
        expiryDate: { type: Date, required: true },
        quantityBoxes: { type: Number, min: 0, default: 0 },
        quantityDoses: { type: Number, min: 0, default: 0 },
        importPricePerBox: { type: Number, min: 0 },
      },
    ],

    indications: [{ type: String, trim: true }],
    contraindications: [{ type: String, trim: true }],
    sideEffects: [{ type: String, trim: true }],
    interactions: [{ type: String, trim: true }],
    warnings: [{ type: String, trim: true }],

    status: {
      type: String,
      enum: ["active", "out_of_stock", "discontinued"],
      default: "active",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

medicationSchema.pre("validate", function (next) {
  if (this.pricing && (this.pricing.pricePerBox === undefined || this.pricing.pricePerBox === null)) {
    const perDose = Number(this.pricing.pricePerDose || 0);
    const dosesPerBox = Number(this.pricing.dosesPerBox || 0);
    this.pricing.pricePerBox = perDose * dosesPerBox;
  }
  next();
});

medicationSchema.virtual("pricing.calculatedPricePerBox").get(function () {
  const perDose = Number(this?.pricing?.pricePerDose || 0);
  const dosesPerBox = Number(this?.pricing?.dosesPerBox || 0);
  return perDose * dosesPerBox;
});

medicationSchema.index({ code: 1 }, { unique: true });
medicationSchema.index({ sku: 1 }, { unique: true, sparse: true });
medicationSchema.index({ name: "text", genericName: "text", brandName: "text" });
medicationSchema.index({ status: 1, "inventory.stockBoxes": 1 });
medicationSchema.index({ "batches.expiryDate": 1 });

export default mongoose.model("Medication", medicationSchema);
