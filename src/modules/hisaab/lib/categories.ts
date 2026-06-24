import type { Category } from '@/modules/hisaab/types';

/** Seeded onto every book that existed before per-book categories shipped, keyed by the original ids so existing transactions keep resolving. */
export const DEFAULT_CATEGORIES: Omit<Category, 'bookId' | 'createdAt'>[] = [
  { id: 'salary',       label: 'Salary',       icon: 'banknote'       },
  { id: 'sale',         label: 'Sale',         icon: 'tag'            },
  { id: 'refund',       label: 'Refund',       icon: 'rotate-ccw'     },
  { id: 'rent',         label: 'Rent',         icon: 'home'           },
  { id: 'investment',   label: 'Investment',   icon: 'trending-up'    },
  { id: 'food',         label: 'Food',         icon: 'utensils'       },
  { id: 'shopping',     label: 'Shopping',     icon: 'shopping-bag'   },
  { id: 'fuel',         label: 'Fuel',         icon: 'fuel'           },
  { id: 'bills',        label: 'Bills',        icon: 'receipt'        },
  { id: 'travel',       label: 'Travel',       icon: 'plane'          },
  { id: 'medical',      label: 'Medical',      icon: 'stethoscope'    },
  { id: 'education',    label: 'Education',    icon: 'graduation-cap' },
  { id: 'construction', label: 'Construction', icon: 'hammer'         },
  { id: 'agriculture',  label: 'Agriculture',  icon: 'wheat'          },
  { id: 'other',        label: 'Other',        icon: 'more-horizontal'},
];
