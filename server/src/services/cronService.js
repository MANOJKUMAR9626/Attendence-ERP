import cron from 'node-cron';

export const setupCronJobs = (io) => {
  // Dummy cron job for now
  cron.schedule('0 0 * * 0', () => {
    console.log('Running weekly cron job for AI predictions...');
  });
};
