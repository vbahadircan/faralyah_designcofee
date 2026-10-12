import { model, Schema, type InferSchemaType } from 'mongoose';

/** The single admin role. Accounts are created by `npm run admin:create`; there is no signup. */
const adminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    /** argon2id hash. The plain password is never stored. */
    passwordHash: { type: String, required: true },
  },
  { timestamps: true, collection: 'admin_users' },
);

export type AdminUserDoc = InferSchemaType<typeof adminUserSchema>;
export const AdminUser = model('AdminUser', adminUserSchema);
