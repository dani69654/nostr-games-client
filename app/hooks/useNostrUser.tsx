import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { nip19 } from 'nostr-tools';
import { connectNDK } from '../User';
import { NDKUserProfile } from '@nostr-dev-kit/ndk';

export const useNostrUser = () => {
    const { nostrKey, publicKey } = useAuthStore();
    const [error, setError] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<NDKUserProfile | null>(null);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!nostrKey || !publicKey) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const ndk = await connectNDK();
                console.log('NDK connected successfully');

                // Get user from public key - properly decode npub format
                let pubKeyHex;
                if (publicKey.startsWith('npub')) {
                    const decoded = nip19.decode(publicKey);
                    if (decoded.type === 'npub') {
                        pubKeyHex = decoded.data;
                    } else {
                        throw new Error('Invalid npub format');
                    }
                } else {
                    pubKeyHex = publicKey;
                }

                console.log('Using public key hex:', pubKeyHex);

                const ndkUser = ndk.getUser({ pubkey: pubKeyHex });

                // Fetch user profile with timeout
                console.log('Fetching user profile...');

                const profile = await ndkUser.fetchProfile();
                console.log('User profile:', profile);

                if (profile) {
                    setUserProfile(profile);
                } else {
                    console.log('No profile found for this user');
                    setUserProfile(null);
                }
            } catch (err) {
                console.error('Error fetching user info:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch user info');
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [nostrKey, publicKey]);

    return {
        isLoadingUserProfile: isLoading,
        userProfileError: error,
        userProfile,
    };
};
