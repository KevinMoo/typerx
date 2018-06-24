import { Appearance } from '../../types/appearance';
import { ServiceContext, Errors, PUT } from 'typescript-rest';
import { Account } from './interfaces/account.interface';
import { CoreDatabase as Db } from './core.database';
import * as passport from 'passport';
import {
  LoginDto,
  LocalStrategyInfo,
  LoginResponse,
  ProfileResponse,
} from './dto/login.dto';
import { LogService } from './log.service';
import { Request, Response, NextFunction } from 'express';
import { pick } from 'lodash';
import { Document } from 'mongoose';
import { EditProfileDto } from './dto/profile.dto';
import { Repository } from '../../database/repository';

export class UserService {
  async login(
    context: ServiceContext,
    loginDto: LoginDto,
  ): Promise<LoginResponse> {
    const { request, response, next } = context;
    const result: LoginResponse = await this.validate(
      request,
      response,
      next,
    );

    const ip: any = request.headers['x-real-ip'] || request.headers['x-forwarded-for'];
    await LogService.save({
      name: 'login',
      operator: loginDto.username,
      operatorIp: ip || request.connection.remoteAddress,
      operation: request.method.toLowerCase() + request.originalUrl,
      comment: '用户登录' + result ? '成功' : '失败',
    });

    return result;
  }

  async getUploadConfig(action: string) {
    const result = {
      "imageUrl": "/images/",
      "imagePath": "/ueditor/images/",
      "imageFieldName": "file",
      "imageMaxSize": 2048,
      "imageAllowFiles": [".png", ".jpg", ".jpeg", ".gif", ".bmp"]
    };
    return result;
  }

  async fileUpload(file: Express.Multer.File,
    field?: string) {
    return {
      url: '/uploads/' + file.filename
    }
  }

  async update(
    context: ServiceContext,
    entry: EditProfileDto,
  ): Promise<ProfileResponse> {

    const { request } = context;
    const profile: any = await Db.Profile.findOneAndUpdate(
      {
        _id: request.user.id,
      },
      entry, { upsert: true, new: true },
    ).exec();

    entry.profile = profile._id;
    const account = await Db.Account.findOneAndUpdate(
      {
        _id: request.user.id,
      },
      entry, { new: true },
    ).populate('profile').exec();

    if (profile) {
      const instance = Repository.mergeProfile(account);
      return instance;
    } else {
      throw new Errors.BadRequestError('user not found');
    }

  }

  private async validate(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<LoginResponse> {
    const result = await new Promise((resolve, reject) => {
      passport.authenticate(
        'local',
        (err: Error, user: Account & Document, info: LocalStrategyInfo) => {
          if (err) {
            reject(false);
          }
          if (user) {
            request.logIn(user, err => {
              if (err) {
                reject(false);
              }
              const picked: LoginResponse = this.pure(user);
              resolve(picked);
            });
          } else {
            resolve(false);
          }
        },
      )(request, response, next);
    });
    return result as LoginResponse;
  }

  private pure(entry: Account & Document): LoginResponse {
    return pick(entry, [
      'id',
      'username',
      'nick',
      'avatar',
      'type',
      'email',
      'groups',
      'roles',
      'mobile',
      'isDisable',
      'isAdmin',
      'isApproved',
      'expired',
    ])
  }

}
