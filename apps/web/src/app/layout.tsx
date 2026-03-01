import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import { AppSidebar } from "@/components/app-sidebar";
import { CommandPalette } from "@/components/command-palette";
import Providers from "@/components/providers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getToken } from "@/lib/auth-server";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "MOSAIC - AI Development Platform",
	description:
		"AI-native development platform for orchestrating agents, conversations, and workflows",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const token = await getToken();
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Providers initialToken={token}>
					<TooltipProvider>
						<SidebarProvider>
							<AppSidebar />
							<CommandPalette />
							<SidebarInset>
								<main className="flex flex-1 flex-col overflow-hidden">
									{children}
								</main>
							</SidebarInset>
						</SidebarProvider>
					</TooltipProvider>
				</Providers>
			</body>
		</html>
	);
}
