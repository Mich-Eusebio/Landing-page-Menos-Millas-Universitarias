export const CAMPAIGN_BASE_RAISED_USD = 25851;
export const CAMPAIGN_GOAL_USD = 45000;
export const SPONSORED_DAY_VALUE_USD = 50;

export function calculateCampaignProgress(additionalSponsoredDays = 0) {
  const safeDays = Math.max(0, Number(additionalSponsoredDays) || 0);
  const totalRaised = CAMPAIGN_BASE_RAISED_USD + (safeDays * SPONSORED_DAY_VALUE_USD);
  const totalPercentage = Number(((totalRaised / CAMPAIGN_GOAL_USD) * 100).toFixed(2));

  return {
    baseRaised: CAMPAIGN_BASE_RAISED_USD,
    sponsoredDays: safeDays,
    sponsoredDayValue: SPONSORED_DAY_VALUE_USD,
    totalRaised,
    totalGoal: CAMPAIGN_GOAL_USD,
    totalPercentage,
  };
}
