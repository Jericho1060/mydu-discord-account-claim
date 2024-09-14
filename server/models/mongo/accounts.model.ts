import { Schema, model } from 'mongoose'

export interface IAccount {
  _id: string
  provider: 'discord' // may be used for other providers in the future
  provider_id: string
  du_account_id: number
  du_account_name: string
  createdAt: Date
  updatedAt: Date
}

const accountSchema = new Schema<IAccount>({
  provider: { type: String, required: true },
  provider_id: { type: String, required: true },
  du_account_id: { type: Number, required: true },
  du_account_name: { type: String, required: true },
}, { timestamps: true })

export const Account = model<IAccount>('Account', accountSchema)
