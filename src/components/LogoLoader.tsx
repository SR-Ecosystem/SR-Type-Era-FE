import { motion } from "framer-motion";

export default function LogoLoader() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* The user's logo in the center */}
        <img 
          src="/logo.png" 
          alt="Loading..." 
          className="w-16 h-16 object-contain z-10 rounded-full" 
        />
        {/* The spinning animated border */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-b-primary opacity-70"
        />
      </div>
    </div>
  );
}
