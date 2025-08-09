// SidebarWhatsAppModals.jsx
import React from "react";
import PropTypes from "prop-types";
import { FaWhatsapp, FaUnlink, FaLink } from "react-icons/fa";

// WhatsApp Phone Search Modal
export const WhatsAppPhoneSearchModal = ({
  show,
  phoneSearchQuery,
  setPhoneSearchQuery,
  handlePhoneSearch,
  setShowPhoneSearch,
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-wa-panel rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold mb-4 text-wa-text">
          Search by Phone Number
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePhoneSearch(phoneSearchQuery);
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-wa-text">
              Phone Number (with country code)
            </label>
            <input
              type="tel"
              value={phoneSearchQuery}
              onChange={(e) => setPhoneSearchQuery(e.target.value)}
              placeholder="+1234567890"
              className="w-full px-3 py-2 bg-wa-input-panel border border-wa-border rounded-md focus:outline-none focus:ring-2 focus:ring-wa-primary text-wa-text placeholder-wa-text-secondary"
              required
            />
            <p className="text-xs text-wa-text-secondary mt-1">
              Include country code (e.g., +1 for US, +91 for India)
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowPhoneSearch(false);
                setPhoneSearchQuery("");
              }}
              className="px-4 py-2 text-wa-text-secondary hover:bg-wa-input-panel rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-wa-primary text-white rounded-md hover:bg-wa-primary/90 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

WhatsAppPhoneSearchModal.propTypes = {
  show: PropTypes.bool.isRequired,
  phoneSearchQuery: PropTypes.string.isRequired,
  setPhoneSearchQuery: PropTypes.func.isRequired,
  handlePhoneSearch: PropTypes.func.isRequired,
  setShowPhoneSearch: PropTypes.func.isRequired,
};

// WhatsApp Settings Modal
export const WhatsAppSettingsModal = ({
  show,
  isWhatsAppLinked,
  whatsappProfile,
  handleUnlinkWhatsApp,
  setShowWhatsAppSettings,
  handleLinkWhatsApp,
  user,
  refetchUsers,
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-wa-panel rounded-lg p-6 w-full max-w-lg mx-4 shadow-2xl">
        <h3 className="text-lg font-semibold mb-4 text-wa-text">
          WhatsApp Integration
        </h3>
        {isWhatsAppLinked ? (
          <div>
            <div className="flex items-center mb-4 p-4 bg-wa-primary/10 border border-wa-primary/20 rounded-lg">
              <FaWhatsapp className="w-8 h-8 text-wa-primary mr-3" />
              <div>
                <h4 className="font-medium text-wa-primary">
                  WhatsApp Account Linked
                </h4>
                {whatsappProfile && (
                  <div className="text-sm text-wa-text-secondary">
                    <p>Phone: +{whatsappProfile.phone_number}</p>
                    {whatsappProfile.whatsapp_name && (
                      <p>Name: {whatsappProfile.whatsapp_name}</p>
                    )}
                    {whatsappProfile.is_business && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mt-1">
                        Business Account
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-6">
              <h5 className="font-medium mb-2 text-wa-text">
                Features Available:
              </h5>
              <ul className="text-sm text-wa-text-secondary space-y-1">
                <li className="flex items-center">
                  <span className="text-wa-primary mr-2">✓</span>
                  Send WhatsApp messages
                </li>
                <li className="flex items-center">
                  <span className="text-wa-primary mr-2">✓</span>
                  Receive message status updates
                </li>
                <li className="flex items-center">
                  <span className="text-wa-primary mr-2">✓</span>
                  Use WhatsApp templates
                </li>
                <li className="flex items-center">
                  <span className="text-wa-primary mr-2">✓</span>
                  Phone number search
                </li>
              </ul>
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleUnlinkWhatsApp}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center transition-colors"
              >
                <FaUnlink className="w-4 h-4 mr-2" />
                Unlink Account
              </button>
              <button
                onClick={() => setShowWhatsAppSettings(false)}
                className="px-4 py-2 text-wa-text-secondary hover:bg-wa-input-panel rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <FaWhatsapp className="w-16 h-16 text-wa-text-secondary mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2 text-wa-text">
                Link Your WhatsApp Account
              </h4>
              <p className="text-wa-text-secondary text-sm">
                Connect your WhatsApp Business account to send and receive
                messages directly from this chat app.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const whatsappData = {
                  wa_id: formData.get("wa_id"),
                  phone_number: formData.get("phone_number"),
                  phone_number_id: formData.get("phone_number_id"),
                  whatsapp_name: formData.get("whatsapp_name"),
                };
                handleLinkWhatsApp(whatsappData);
              }}
            >
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-wa-text">
                    WhatsApp ID
                  </label>
                  <input
                    name="wa_id"
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-wa-input-panel border border-wa-border rounded-md focus:outline-none focus:ring-2 focus:ring-wa-primary text-wa-text placeholder-wa-text-secondary"
                    placeholder="Your WhatsApp ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-wa-text">
                    Phone Number
                  </label>
                  <input
                    name="phone_number"
                    type="tel"
                    required
                    className="w-full px-3 py-2 bg-wa-input-panel border border-wa-border rounded-md focus:outline-none focus:ring-2 focus:ring-wa-primary text-wa-text placeholder-wa-text-secondary"
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-wa-text">
                    Phone Number ID
                  </label>
                  <input
                    name="phone_number_id"
                    type="text"
                    className="w-full px-3 py-2 bg-wa-input-panel border border-wa-border rounded-md focus:outline-none focus:ring-2 focus:ring-wa-primary text-wa-text placeholder-wa-text-secondary"
                    placeholder="WhatsApp Business Phone Number ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-wa-text">
                    Display Name
                  </label>
                  <input
                    name="whatsapp_name"
                    type="text"
                    className="w-full px-3 py-2 bg-wa-input-panel border border-wa-border rounded-md focus:outline-none focus:ring-2 focus:ring-wa-primary text-wa-text placeholder-wa-text-secondary"
                    placeholder="Your display name on WhatsApp"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWhatsAppSettings(false)}
                  className="px-4 py-2 text-wa-text-secondary hover:bg-wa-input-panel rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-wa-primary text-white rounded-md hover:bg-wa-primary/90 flex items-center transition-colors"
                >
                  <FaLink className="w-4 h-4 mr-2" />
                  Link Account
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

WhatsAppSettingsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  isWhatsAppLinked: PropTypes.bool.isRequired,
  whatsappProfile: PropTypes.object,
  handleUnlinkWhatsApp: PropTypes.func.isRequired,
  setShowWhatsAppSettings: PropTypes.func.isRequired,
  handleLinkWhatsApp: PropTypes.func.isRequired,
  user: PropTypes.object,
  refetchUsers: PropTypes.func,
};
