/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as cart from "../cart.js";
import type * as certificates from "../certificates.js";
import type * as clearData from "../clearData.js";
import type * as courses from "../courses.js";
import type * as enrollments from "../enrollments.js";
import type * as lessonProgress from "../lessonProgress.js";
import type * as lessons from "../lessons.js";
import type * as notifications from "../notifications.js";
import type * as payments from "../payments.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as seedLessons from "../seedLessons.js";
import type * as seedNotifications from "../seedNotifications.js";
import type * as settings from "../settings.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  cart: typeof cart;
  certificates: typeof certificates;
  clearData: typeof clearData;
  courses: typeof courses;
  enrollments: typeof enrollments;
  lessonProgress: typeof lessonProgress;
  lessons: typeof lessons;
  notifications: typeof notifications;
  payments: typeof payments;
  reviews: typeof reviews;
  seed: typeof seed;
  seedLessons: typeof seedLessons;
  seedNotifications: typeof seedNotifications;
  settings: typeof settings;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
