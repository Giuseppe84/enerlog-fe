"use client"

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";


import { generate, disable,enable, status } from "@/api/2fa"
import { Dialog, DialogFooter, DialogTitle, DialogHeader, DialogPortal, DialogOverlay, DialogContent, DialogClose } from "@/components/ui/dialog"
import { userAPI } from "@/api/user";


const TwoFAToggle = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
const [verificationCode, setVerificationCode] = useState("");
  /*
  router.post('/register', register);
  router.post('/login', login);
  router.post('/2fa/setup', authenticate, enable2FA);
  router.post('/2fa/verify', authenticate, verify2FA);
  router.get("/2fa/status", authenticate, get2FAStatus);
  router.get("/2fa/generate", authenticate, generate2FASecret);
  router.post("/2fa/disable", authenticate, disable2FA);
  
  */


  useEffect(() => {
    userAPI.getUser()
      .then((res) => {
        console.log(res);
        setEnabled(res.isTwoFactorEnabled);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = async (checked: boolean) => {
    const newValue = checked;
    setEnabled(newValue);

    if (newValue) {
      const res = await generate();
      console.log(res)
      setQrCode(res.qrCode);
      setSecret(res.secret);

      setModalOpen(true);
    } else {
      await disable();
    }
  };

const handleVerify = async() => {
   const res = await enable(verificationCode);
  console.log("Invio codice:", verificationCode);
};


  if (loading) return <Loader2 className="animate-spin" />;

  return (
    <div className="mt-2">
      <div className="flex items-center space-x-2">
        <Switch
          id="2fa-toggle"
          checked={enabled}
          onCheckedChange={handleChange}
        />
        <Label htmlFor="2fa-toggle" className="cursor-pointer">
          Autenticazione a due fattori (2FA)
        </Label>
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogPortal>
          {/* Overlay */}
          <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modale */}
          <DialogContent
            className="
        fixed left-1/2 top-1/2 
        -translate-x-1/2 -translate-y-1/2 
        w-[90%] max-w-md 
        rounded-xl bg-white shadow-xl p-6
        animate-in fade-in zoom-in
      "
          >
            <DialogTitle className="text-xl font-semibold mb-4">
              Enable Two-Factor Authentication
            </DialogTitle>

            <p className="text-sm text-gray-600 mb-3">
              Scan this QR code with Google Authenticator or any 2FA app:
            </p>

            {qrCode && (
              <img
                src={qrCode}
                alt="QR Code"
                className="mx-auto w-48 h-48 rounded-md border"
              />
            )}

            {/* Secret code */}
            {secret && (
              <div className="mt-4 w-full">
                <p className="text-sm text-gray-600">Or enter this code manually:</p>

                <p
                  className=" font-mono break-all text-lg bg-gray-100 p-3 rounded-md mt-1  text-center w-full"
                >
                  {secret}
                </p>
                <div className="mt-6 w-full">
                  <label className="text-sm text-gray-600" htmlFor="totp">
                    Enter the verification code:
                  </label>

                  <input
                    id="totp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="
      mt-2 w-full rounded-md border border-gray-300 
      px-3 py-2 text-center text-lg tracking-widest 
      font-mono focus:outline-none focus:ring-2 
      focus:ring-blue-500 focus:border-blue-500
    "
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                  />

                  <button
                    onClick={handleVerify}
                    className="
      mt-4 w-full bg-blue-600 hover:bg-blue-700 
      text-white font-medium py-2 rounded-md transition
    "
                  >
                    Verify Code
                  </button>
                </div>
              </div>

            )}

            {/* Buttons */}
            <div className="mt-6 flex justify-end">
              <DialogClose asChild>
                <button
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </DialogClose>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
};

export default TwoFAToggle;


