import { PropFirm } from './types';

export const INITIAL_FIRMS: PropFirm[] = [
  {
    id: 'ftmo',
    name: 'FTMO',
    websiteUrl: 'https://ftmo.com',
    logoUrl: 'https://logo.clearbit.com/ftmo.com',
    slug: 'ftmo',
    description: 'FTMO is widely considered the gold standard in the prop firm industry, known for its reliability and fast payouts.',
    pros: ['Excellent reputation', 'Bi-weekly payouts', 'Wide range of instruments'],
    cons: ['Strict trading rules', 'Expensive challenge fees'],
    startingBalance: '$10k - $200k',
    maxLeverage: '1:100',
    profitSplit: 'up to 90%'
  },
  {
    id: 'the5ers',
    name: 'The 5%ers',
    websiteUrl: 'https://the5ers.com',
    logoUrl: 'https://logo.clearbit.com/the5ers.com',
    slug: 'the-5ers',
    description: 'Focuses on long-term growth and scaling for professional traders.',
    pros: ['Scaling plan up to $4M', 'Real capital from day 1', 'Supportive community'],
    cons: ['Lower leverage', 'Complex scaling rules'],
    startingBalance: '$6k - $250k',
    maxLeverage: '1:30',
    profitSplit: 'up to 100%'
  },
  {
    id: 'topstep',
    name: 'Topstep',
    websiteUrl: 'https://topstep.com',
    logoUrl: 'https://logo.clearbit.com/topstep.com',
    slug: 'topstep',
    description: 'A popular choice for futures traders, recently expanding options.',
    pros: ['Great for futures', 'Regular promotions', 'Focus on education'],
    cons: ['Mainly futures-focused', 'Daily loss limits can be tight'],
    startingBalance: '$50k - $150k',
    maxLeverage: 'Adjustable',
    profitSplit: '90%'
  },
  {
    id: 'myforexfunds',
    name: 'MyForexFunds',
    websiteUrl: 'https://myforexfunds.com',
    logoUrl: 'https://logo.clearbit.com/myforexfunds.com',
    slug: 'myforexfunds',
    description: 'Currently facing significant regulatory challenges and operational issues.',
    pros: ['Used to have low entry fees'],
    cons: ['Regulatory shutdown', 'Non-functional payouts', 'High risk'],
    startingBalance: 'N/A',
    maxLeverage: 'N/A',
    profitSplit: 'N/A'
  },
  {
    id: 'lux-trading',
    name: 'Lux Trading Firm',
    websiteUrl: 'https://luxtradingfirm.com',
    logoUrl: 'https://logo.clearbit.com/luxtradingfirm.com',
    description: 'A higher-end prop firm with significant scaling opportunities.',
    pros: ['Institutional liquidity', 'No time limits'],
    cons: ['Very high setup fees'],
    startingBalance: '$50k - $10M',
    maxLeverage: '1:30',
    profitSplit: '75%',
    slug: 'lux-trading'
  },
  {
    id: 'blueberry-funded',
    name: 'Blueberry Funded',
    websiteUrl: 'https://blueberryfunded.com/?utm_source=affiliate&ref=694',
    logoUrl: 'https://logo.clearbit.com/blueberryfunded.com',
    slug: 'blueberry-funded',
    description: 'A relatively new entrant backed by the established Blueberry Markets brokerage, offering competitive trading conditions.',
    pros: ['Backed by reputable broker', 'MT4/MT5 available', 'Balance-based drawdown'],
    cons: ['Newer platform', 'Limited history'],
    startingBalance: '$10k - $200k',
    maxLeverage: '1:100',
    profitSplit: '80%',
    discountCode: 'EDGE'
  }
];

// Re-adjusting the rating type in types.ts in my thought process... 
// Actually I'll use 'good' (green), 'medium' (blue), 'bad' (red)
// I will update types.ts accordingly.
