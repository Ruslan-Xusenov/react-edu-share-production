import { useState, useEffect } from 'react';
import './PWAInstallBanner.css';

const PWAInstallBanner = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            setIsInstalled(true);
            return;
        }

        // Check if already dismissed in this session
        const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
        if (dismissed) return;

        // Detect iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(isIOSDevice);

        if (isIOSDevice) {
            // iOS doesn't support beforeinstallprompt - show manual guide after delay
            const timer = setTimeout(() => setShowBanner(true), 3000);
            return () => clearTimeout(timer);
        }

        // Android & Desktop Chrome/Edge: capture install prompt
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            setShowBanner(false);
            setDeferredPrompt(null);
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        sessionStorage.setItem('pwa-banner-dismissed', 'true');
    };

    if (isInstalled || !showBanner) return null;

    return (
        <div className="pwa-banner" role="alert" aria-label="Ilovani o'rnatish">
            <div className="pwa-banner-icon">
                <img src="/icons/icon-72x72.png" alt="EduShare" width="44" height="44" />
            </div>
            <div className="pwa-banner-text">
                <strong>EduShare School</strong>
                {isIOS ? (
                    <span>Safari → <em>ulashish</em> → "Bosh ekranga qo'shish"</span>
                ) : (
                    <span>Ilovani qurilmangizga o'rnating</span>
                )}
            </div>
            {!isIOS && (
                <button className="pwa-banner-install" onClick={handleInstall}>
                    O'rnatish
                </button>
            )}
            <button className="pwa-banner-close" onClick={handleDismiss} aria-label="Yopish">
                ✕
            </button>
        </div>
    );
};

export default PWAInstallBanner;
