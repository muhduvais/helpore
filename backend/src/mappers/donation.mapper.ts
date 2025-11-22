import { plainToInstance } from 'class-transformer';
import { IDonation } from '../models/donation.model';
import { DonationDTO } from '../dtos/donation.dto';
import { toUserDTO } from './user.mapper';
import { IUserDocument } from '../interfaces/user.interface';

export const toDonationDTO = (donation: IDonation): DonationDTO => {
  const obj = {
    id: donation._id?.toString ? donation._id.toString() : String((donation).id ?? ''),
    stripeSessionId: donation.stripeSessionId ?? '',
    stripePaymentId: donation.stripePaymentId ?? '',
    amount: donation.amount ?? 0,
    campaign: donation.campaign ?? '',
    message: donation.message ?? undefined,
    isAnonymous: Boolean(donation.isAnonymous),
    userId:  donation.userId ? toUserDTO(donation.userId as IUserDocument) : null,
    status: (donation.status as any) ?? 'pending',
    date:
      donation.date instanceof Date
        ? donation.date.toISOString()
        : donation.date
        ? String(donation.date)
        : donation.createdAt instanceof Date
        ? donation.createdAt.toISOString()
        : new Date().toISOString(),
    createdAt:
      donation.createdAt instanceof Date ? donation.createdAt.toISOString() : String(donation.createdAt ?? new Date().toISOString()),
    updatedAt:
      donation.updatedAt instanceof Date ? donation.updatedAt.toISOString() : String(donation.updatedAt ?? new Date().toISOString()),
  };

  return plainToInstance(DonationDTO, obj);
};

export const toDonationListDTO = (donations: IDonation[]): DonationDTO[] => {
  return donations.map(toDonationDTO);
};
