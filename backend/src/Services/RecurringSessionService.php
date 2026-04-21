<?php

declare(strict_types=1);

namespace App\Services;

use DateTime;
use DateInterval;

class RecurringSessionService
{
    /**
     * Generate recurring session dates based on recurrence rule
     *
     * @param string $startDate Starting date in Y-m-d format
     * @param array $recurrenceRule Recurrence rule array
     * @return array Array of date strings
     */
    public function generateRecurringDates(string $startDate, array $recurrenceRule): array
    {
        $dates = [];
        $currentDate = new DateTime($startDate);
        $frequency = $recurrenceRule['frequency'] ?? 'weekly';
        $interval = (int)($recurrenceRule['interval'] ?? 1);
        $endType = $recurrenceRule['endType'] ?? 'never';
        $maxOccurrences = 365; // Safety limit

        // Determine end condition
        $endDate = null;
        $endCount = null;

        if ($endType === 'date' && !empty($recurrenceRule['endDate'])) {
            $endDate = new DateTime($recurrenceRule['endDate']);
        } elseif ($endType === 'count' && !empty($recurrenceRule['endCount'])) {
            $endCount = (int)$recurrenceRule['endCount'];
        }

        $count = 0;

        while ($count < $maxOccurrences) {
            // Add current date if it matches the criteria
            if ($this->matchesRecurrencePattern($currentDate, $startDate, $recurrenceRule, $count)) {
                $dates[] = $currentDate->format('Y-m-d');
                $count++;

                // Check end conditions
                if ($endCount && $count >= $endCount) {
                    break;
                }
            }

            // Move to next date
            $currentDate = $this->getNextDate($currentDate, $frequency, $interval);

            // Check end date
            if ($endDate && $currentDate > $endDate) {
                break;
            }

            // Safety check for 'never' ending recurrences - limit to 2 years
            if ($endType === 'never' && $count >= 104) { // 2 years of weekly sessions
                break;
            }
        }

        return $dates;
    }

    /**
     * Check if a date matches the recurrence pattern
     *
     * @param DateTime $date Date to check
     * @param string $startDate Original start date
     * @param array $recurrenceRule Recurrence rule
     * @param int $occurrence Current occurrence number
     * @return bool
     */
    private function matchesRecurrencePattern(DateTime $date, string $startDate, array $recurrenceRule, int $occurrence): bool
    {
        $frequency = $recurrenceRule['frequency'] ?? 'weekly';

        // First occurrence always matches
        if ($occurrence === 0) {
            return true;
        }

        // For weekly recurrence, check days of week
        if ($frequency === 'weekly' && !empty($recurrenceRule['daysOfWeek'])) {
            $dayOfWeek = (int)$date->format('w'); // 0 = Sunday, 6 = Saturday
            return in_array($dayOfWeek, $recurrenceRule['daysOfWeek']);
        }

        return true;
    }

    /**
     * Get the next date based on frequency and interval
     *
     * @param DateTime $currentDate Current date
     * @param string $frequency Frequency type
     * @param int $interval Interval value
     * @return DateTime
     */
    private function getNextDate(DateTime $currentDate, string $frequency, int $interval): DateTime
    {
        $nextDate = clone $currentDate;

        switch ($frequency) {
            case 'daily':
                $nextDate->add(new DateInterval("P{$interval}D"));
                break;
            case 'weekly':
                $nextDate->add(new DateInterval("P1D")); // Add 1 day, filter by daysOfWeek
                break;
            case 'monthly':
                $nextDate->add(new DateInterval("P{$interval}M"));
                break;
        }

        return $nextDate;
    }

    /**
     * Generate a unique recurring group ID
     *
     * @return string UUID v4
     */
    public function generateRecurringGroupId(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    /**
     * Create multiple session records from recurrence rule
     *
     * @param array $sessionData Base session data
     * @param array $recurrenceRule Recurrence rule
     * @return array Array of session data with dates
     */
    public function createRecurringSessions(array $sessionData, array $recurrenceRule): array
    {
        $startDate = $sessionData['date'];
        $dates = $this->generateRecurringDates($startDate, $recurrenceRule);

        $recurringGroupId = $this->generateRecurringGroupId();
        $sessions = [];

        foreach ($dates as $date) {
            $session = $sessionData;
            $session['date'] = $date;
            $session['is_recurring'] = 1;
            $session['recurring_group_id'] = $recurringGroupId;
            $session['recurrence_rule'] = json_encode($recurrenceRule);
            $session['recurrence_exception'] = 0;

            $sessions[] = $session;
        }

        return $sessions;
    }

    /**
     * Delete recurring sessions based on deletion mode
     *
     * @param string $recurringGroupId The recurring group ID
     * @param string $fromDate Date from which to delete (for 'this_and_following' mode)
     * @param string $mode 'this' | 'this_and_following' | 'all'
     * @return array SQL conditions for deletion
     */
    public function getDeleteConditions(string $recurringGroupId, string $fromDate, string $mode): array
    {
        switch ($mode) {
            case 'this':
                // Delete only the specific date
                return [
                    'recurring_group_id' => $recurringGroupId,
                    'date' => $fromDate
                ];

            case 'this_and_following':
                // Delete this and all future occurrences
                return [
                    'recurring_group_id' => $recurringGroupId,
                    'date_gte' => $fromDate // Greater than or equal
                ];

            case 'all':
            default:
                // Delete all in the series
                return [
                    'recurring_group_id' => $recurringGroupId
                ];
        }
    }
}
