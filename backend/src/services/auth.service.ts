import { userRepository } from '../repositories/user.repository.js';
import { profileRepository } from '../repositories/profile.repository.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';
import { HttpError } from '../errors/HttpError.js';
import { activityService } from './activity.service.js';
import type { RegisterDtoType, LoginDtoType } from '../dtos/auth.dto.js';

export const authService = {
  async register(dto: RegisterDtoType) {
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) {
      throw HttpError.conflict('An account with this email already exists');
    }

    const hashed = await hashPassword(dto.password);
    const user = await userRepository.create({ email: dto.email, password: hashed });

    // Create stub profile
    await profileRepository.create({
      firstName: '',
      lastName: '',
      user: { connect: { id: user.id } },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const fullUser = await userRepository.findByIdWithProfile(user.id);
    activityService.log(user.id, 'account', 'Registered account', dto.email);
    return { token, user: { id: fullUser!.id, email: fullUser!.email, role: fullUser!.role, createdAt: fullUser!.createdAt, profile: fullUser!.profile } };
  },

  async login(dto: LoginDtoType) {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      throw HttpError.unauthorized('Invalid email or password');
    }

    const valid = await comparePassword(dto.password, user.password);
    if (!valid) {
      throw HttpError.unauthorized('Invalid email or password');
    }

    if (user.role !== 'CANDIDATE') {
      throw HttpError.forbidden('Please use the correct login portal for your account type');
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const fullUser = await userRepository.findByIdWithProfile(user.id);
    activityService.log(user.id, 'account', 'Signed in');
    return { token, user: { id: fullUser!.id, email: fullUser!.email, role: fullUser!.role, createdAt: fullUser!.createdAt, profile: fullUser!.profile } };
  },

  async getMe(userId: string) {
    const user = await userRepository.findByIdWithProfile(userId);
    if (!user) {
      throw HttpError.notFound('User not found');
    }
    const profile = user.profile as (typeof user.profile & { plan?: any }) | null;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      profile: user.profile,
      usage: profile ? {
        cvCreationLimit: profile.cvCreationLimit,
        cvCreationsUsed: profile.cvCreationsUsed,
        applicationLimitUsed: profile.applicationLimitUsed,
        applicationLimit: profile?.plan?.applicationLimit ?? null,
      } : null,
      plan: profile?.plan ?? null,
    };
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw HttpError.notFound('User not found');

    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) throw HttpError.unauthorized('Current password is incorrect');

    const hashed = await hashPassword(newPassword);
    await userRepository.update(userId, { password: hashed });
    activityService.log(userId, 'account', 'Changed password');
    return { message: 'Password updated successfully' };
  },
};
