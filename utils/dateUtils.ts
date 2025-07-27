import { format, parseISO, isValid, differenceInDays, addDays } from 'date-fns';

export const formatDate = (date: string | Date, formatString: string = 'MMM dd, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    return format(dateObj, formatString);
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const formatRelativeDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    
    const now = new Date();
    const diffDays = differenceInDays(now, dateObj);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === -1) return 'Tomorrow';
    if (diffDays > 0) return `${diffDays} days ago`;
    return `In ${Math.abs(diffDays)} days`;
  } catch (error) {
    return 'Invalid Date';
  }
};

export const getDaysUntilHarvest = (plantingDate: string, expectedHarvestDate?: string): number | null => {
  try {
    if (!expectedHarvestDate) return null;
    
    const harvestDate = parseISO(expectedHarvestDate);
    const now = new Date();
    
    if (!isValid(harvestDate)) return null;
    
    return differenceInDays(harvestDate, now);
  } catch (error) {
    return null;
  }
};

export const getGrowingDays = (plantingDate: string): number => {
  try {
    const planted = parseISO(plantingDate);
    const now = new Date();
    
    if (!isValid(planted)) return 0;
    
    return Math.max(0, differenceInDays(now, planted));
  } catch (error) {
    return 0;
  }
};

export const addDaysToDate = (date: string | Date, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
};