import {
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  formatDistanceToNow,
  isToday,
  isYesterday,
} from "date-fns";

const getLastSeen = (lastSeen) => {
  const lastSeenDate = new Date(lastSeen);
  const now = new Date();

  if (now - lastSeenDate < 60 * 1000) {
    return { text: "Active now", isActive: true };
  }

  if (isToday(lastSeenDate)) {
    return {
      text: `Last seen ${formatDistanceToNow(lastSeenDate, {
        addSuffix: true,
      })}`,
      isActive: false,
    };
  }

  if (isYesterday(lastSeenDate)) {
    return {
      text: `Last seen yesterday at ${lastSeenDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      isActive: false,
    };
  }

  const daysDifference = differenceInDays(now, lastSeenDate);
  if (daysDifference <= 6) {
    return {
      text: `Last seen ${daysDifference} day${
        daysDifference > 1 ? "s" : ""
      } ago at ${lastSeenDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      isActive: false,
    };
  }

  const weeksDifference = differenceInWeeks(now, lastSeenDate);
  if (weeksDifference <= 3) {
    return {
      text: `Last seen ${weeksDifference} week${
        weeksDifference > 1 ? "s" : ""
      } ago`,
      isActive: false,
    };
  }

  const monthsDifference = differenceInMonths(now, lastSeenDate);
  if (monthsDifference <= 11) {
    return {
      text: `Last seen ${monthsDifference} month${
        monthsDifference > 1 ? "s" : ""
      } ago`,
      isActive: false,
    };
  }

  const yearsDifference = differenceInYears(now, lastSeenDate);
  if (yearsDifference > 0) {
    return {
      text: `Last seen ${yearsDifference} year${
        yearsDifference > 1 ? "s" : ""
      } ago`,
      isActive: false,
    };
  }

  return {
    text: `Last seen on ${lastSeenDate.toLocaleDateString()} at ${lastSeenDate.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`,
    isActive: false,
  };
};

export default getLastSeen;
