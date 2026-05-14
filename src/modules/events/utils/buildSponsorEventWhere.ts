import { Prisma } from "@/core/prisma/generated/client";
import { SponsorEventsQuery } from "../validators/queryEvents";

export const  buildSponsorEventWhere = (
    filters: SponsorEventsQuery,
  ): Prisma.EventWhereInput => {
    const where: Prisma.EventWhereInput = {
      published: true,
    };
  
    if (filters.target_amount_from != null || filters.target_amount_to != null) {
      where.target_amount = {};
      if (filters.target_amount_from != null) {
        where.target_amount.gte = filters.target_amount_from;
      }
      if (filters.target_amount_to != null) {
        where.target_amount.lte = filters.target_amount_to;
      }
    }
  
    if (filters.audience_from != null || filters.audience_to != null) {
      where.expected_attendance = {};
      if (filters.audience_from != null) {
        where.expected_attendance.gte = filters.audience_from;
      }
      if (filters.audience_to != null) {
        where.expected_attendance.lte = filters.audience_to;
      }
    }
  
    if (filters.location !== "all") {
      where.location = filters.location;
    }
  
    if (filters.industry !== "all") {
      where.industry_field = filters.industry;
    }
  
    if (filters.tags && filters.tags.length > 0) {
      where.AND = filters.tags.map((tag) => ({
        tags: { contains: tag },
      }));
    }
  
    return where;
  }