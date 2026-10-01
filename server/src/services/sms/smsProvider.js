export default class SMSProvider {
  /**
   * Send an SMS message
   * @param {Object} options
   * @param {string} options.phoneNumber - Formatted phone number
   * @param {string} options.message - The SMS content
   * @param {string} options.senderId - Configured Sender ID
   * @param {string} options.templateId - Configured DLT Template ID
   * @param {Object} options.credentials - Decrypted credentials object
   * @returns {Promise<Object>} { success, messageId, error }
   */
  async sendSMS(options) {
    throw new Error('sendSMS method must be implemented');
  }

  /**
   * Test the connection with the provider using provided credentials
   * @param {Object} options
   * @param {Object} options.credentials - Decrypted credentials object
   * @returns {Promise<boolean>}
   */
  async testConnection(options) {
    throw new Error('testConnection method must be implemented');
  }
}
