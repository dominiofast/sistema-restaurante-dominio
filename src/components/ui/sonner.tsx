import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          backgroundColor: '#ffffff',
          color: '#224276',
          border: '1px solid rgba(34, 66, 118, 0.2)',
          boxShadow: '0 10px 25px rgba(34, 66, 118, 0.15)',
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-blue-200 group-[.toaster]:shadow-xl",
          description: "group-[.toast]:text-gray-600",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:hover:bg-blue-700",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600 group-[.toast]:hover:bg-gray-200",
          success: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-cyan-500 group-[.toast]:to-blue-600 group-[.toast]:text-white group-[.toast]:border-cyan-400",
          error: "group-[.toast]:bg-red-500 group-[.toast]:text-white group-[.toast]:border-red-400",
          warning: "group-[.toast]:bg-orange-500 group-[.toast]:text-white group-[.toast]:border-orange-400",
          info: "group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:border-blue-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }