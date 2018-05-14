import { ServiceContext } from 'typescript-rest';
import { Appearance, PaginateResponse } from './../../types/appearance';
import { AccountService } from './account.service';
import { CreateAccountDto, EditAccountDto, AccountResponse } from './dto/account.dto';
import { ProfileResponse } from './dto/login.dto';
/**
 * 帐号管理.
 */
export declare class AccountController {
    private readonly service;
    context: ServiceContext;
    constructor(service?: AccountService);
    /**
     * 创建帐号
     * @param entry 帐号信息
     */
    create(entry: CreateAccountDto): Promise<AccountResponse>;
    /**
     * 更新帐号
     * @param entry 帐号信息
     */
    update(entry: EditAccountDto): Promise<AccountResponse>;
    /**
     * 获取帐号管理界面配置信息.
     */
    getConfig(): Promise<Appearance>;
    /**
     * 按关键词查询账号
     *
     * @param {string} [keyword]
     * @returns {Promise<Account[]>}
     * @memberof AccountController
     */
    getAccountsByKeyword(keyword?: string): Promise<AccountResponse[]>;
    /**
     * 分页查询帐号数据
     * @param keyword 关键词
     */
    query(keyword?: string, page?: number, size?: number, sort?: string): Promise<PaginateResponse<AccountResponse[]>>;
    /**
     * 帐户信息
     */
    profile(): Promise<ProfileResponse>;
    /**
     * 删除帐号
     * @param id 帐号编号
     */
    remove(id: string): Promise<boolean>;
    /**
     * 查询帐号
     * @param id 编号
     */
    get(id: string): Promise<AccountResponse>;
}
