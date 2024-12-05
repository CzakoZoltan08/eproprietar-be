import { FilterOperator, PaginateConfig } from 'nestjs-paginate';
import { Announcement } from './entities/announcement.entity';

export const PaginateConfigAnnouncements: PaginateConfig<Announcement> = {
  /**
   * Required: true (must have a minimum of one column)
   * Type: (keyof Announcement)[]
   * Description: These are the columns that are valid to be sorted by.
   */
  sortableColumns: ['createdAt'],

  /**
   * Required: false
   * Type: [keyof Announcement, 'ASC' | 'DESC'][]
   * Default: [[sortableColumns[0], 'ASC]]
   * Description: The order to display the sorted entities.
   */
  defaultSortBy: [['createdAt', 'DESC']],

  /**
   * Required: false
   * Type: (keyof Announcement)[]
   * Description: These columns will be searched through when using the search query
   * param. Limit search scope further by using `searchBy` query param.
   */
  // searchableColumns: ['userName', 'entityType', 'action', 'status'],

  /**
   * Required: false
   * Type: number
   * Default: 100
   * Description: The maximum amount of entities to return per page.
   */
  maxLimit: 100,

  /**
   * Required: false
   * Type: number
   * Default: 20
   */
  defaultLimit: 25,

  /**
   * Required: false
   * Type: TypeORM find options
   * Default: None
   * https://typeorm.io/#/find-optionsfind-options.md
   */
  // where: {
  //   // user: ,
  // },

  /**
   * Required: false
   * Type: { [key in Announcement]?: FilterOperator[] } - Operators based on TypeORM find operators
   * Default: None
   * https://typeorm.io/#/find-options/advanced-options
   */
  filterableColumns: {
    city: [FilterOperator.EQ, FilterOperator.IN],
    announcementType: [FilterOperator.EQ, FilterOperator.IN],
    transactionType: [FilterOperator.EQ, FilterOperator.IN],
    rooms: [
      FilterOperator.EQ,
      FilterOperator.GTE,
      FilterOperator.LTE,
      FilterOperator.BTW,
    ],
    price: [
      FilterOperator.EQ,
      FilterOperator.GTE,
      FilterOperator.LTE,
      FilterOperator.BTW,
    ],
    surface: [
      FilterOperator.EQ,
      FilterOperator.GTE,
      FilterOperator.LTE,
      FilterOperator.BTW,
    ],
    user: [FilterOperator.EQ],
  },

  /**
   * Required: false
   * Type: RelationColumn<Announcement>
   * Description: Indicates what relations of entity should be loaded.
   */
  relations: ['user'],
};
