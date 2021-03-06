import { injectable, inject } from 'tsyringe';

import IHashProvider from '../providers/HashProvider/modules/IHashProvider';

import AppError from '@shared/errors/AppError';

import User from '../infra/typeorm/entities/User';
import IUserRepository from '../repositories/IUsersRepository';

interface Request {
  name: string;
  email: string;
  password: string;
}

@injectable()
export default class CreateUsersService {
  constructor(
    @inject('UsersRepository')
    private readonly _userRepository: IUserRepository,

    @inject('IHashProvider')
    private readonly _hashProvider: IHashProvider,
  ) {}

  public async exercute({ email, password, name }: Request): Promise<User> {
    const checkUserExists = await this._userRepository.findByEmail(email);

    if (checkUserExists) {
      throw new AppError('Email address already in use.');
    }

    const hasedPassword = await this._hashProvider.generateHash(password);

    const user = await this._userRepository.create({
      email,
      password: hasedPassword,
      name,
    });

    return user;
  }
}
