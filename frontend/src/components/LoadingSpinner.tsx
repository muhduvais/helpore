import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from 'framer-motion';

export const LoadingSpinner = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center items-center min-h-[60vh]"
        >
            <DotLottieReact
                src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                loop
                autoplay
                style={{ width: '50px', height: '50px' }}
            />
        </motion.div>
    );
}