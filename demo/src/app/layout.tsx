import { Navbar } from "../components/Navbar";

export default function RootLayout({children}: {children: React.ReactNode}) {
    return (
        <div>
            <Navbar />
            <main>
                {children}
            </main>
        </div>
    );
}
