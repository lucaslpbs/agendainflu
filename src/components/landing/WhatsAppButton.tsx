import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href={"https://wa.me/" + (process.env.NEXT_PUBLIC_SUPPORT_WA || "5585999990000") + "?text=Ola! Gostaria de saber mais sobre o AgendaInflu."}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-float"
      aria-label="WhatsApp"
    >
      <MessageCircle className="text-primary-foreground" size={28} />
    </a>
  );
};

export default WhatsAppButton;
