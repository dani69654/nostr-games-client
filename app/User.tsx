/* eslint-disable @next/next/no-img-element */
'use client';

import NDK from '@nostr-dev-kit/ndk';
import { useAuthStore } from './stores/authStore';
import { NOSTR_RELAYS } from './lib/nostr.lib';
import { useNostrUser } from './hooks/useNostrUser';

export const connectNDK = async (): Promise<NDK> => {
    const ndk = new NDK({ explicitRelayUrls: NOSTR_RELAYS });
    await ndk.connect();
    return ndk;
};

export default function User() {
    const { nostrKey, publicKey } = useAuthStore();
    const { userProfile, isLoadingUserProfile, userProfileError } = useNostrUser();

    if (!nostrKey || !publicKey) {
        return null;
    }

    if (isLoadingUserProfile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-white">Loading user info...</p>
                </div>
            </div>
        );
    }

    if (userProfileError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
                        <p className="text-red-300">{userProfileError}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 w-full">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">Games Dashboard</h1>

                {/* User Profile Card */}
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-purple-400 mb-4">User Profile</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Profile Picture & Basic Info */}
                        <div className="flex items-center gap-4">
                            {userProfile?.image ? (
                                <img
                                    src={userProfile.image}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full border-2 border-purple-500/30"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                                    <span className="text-white text-xl font-bold">
                                        {userProfile?.name?.[0]?.toUpperCase() || '?'}
                                    </span>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xl font-semibold text-white">
                                    {userProfile?.name || userProfile?.displayName || 'Anonymous'}
                                </h3>
                                {userProfile?.nip05 && <p className="text-purple-300 text-sm">{userProfile.nip05}</p>}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Public Key:</span>
                                <span className="text-white font-mono text-sm">{publicKey.slice(0, 16)}...</span>
                            </div>
                            {userProfile?.website && (
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Website:</span>
                                    <a
                                        href={userProfile.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        {userProfile.website}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    {userProfile?.about && (
                        <div className="mt-4 pt-4 border-t border-slate-600">
                            <h4 className="text-slate-400 text-sm font-medium mb-2">About</h4>
                            <p className="text-white">{userProfile.about}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
