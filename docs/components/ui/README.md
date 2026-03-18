# Componentes UI (shadcn/ui)

> **Caminho:** `src/components/ui/`
> **Origem:** [shadcn/ui](https://ui.shadcn.com/) — componentes gerados localmente, sem dependência de pacote externo

Todos os componentes abaixo são baseados em Radix UI primitives + Tailwind CSS. Não há lógica de negócio nesses arquivos — customizações visuais estão em `tailwind.config.ts` e `src/index.css`.

## Lista de componentes

| Arquivo | Componentes exportados | Uso principal |
|---------|------------------------|---------------|
| `accordion.tsx` | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | FAQ da landing page |
| `alert-dialog.tsx` | `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel` | Confirmações destrutivas |
| `alert.tsx` | `Alert`, `AlertTitle`, `AlertDescription` | Mensagens de erro/aviso |
| `aspect-ratio.tsx` | `AspectRatio` | Contêiner com proporção fixa |
| `avatar.tsx` | `Avatar`, `AvatarImage`, `AvatarFallback` | Foto de perfil com fallback de iniciais |
| `badge.tsx` | `Badge` | Tags de status (agendamentos, influenciadoras) |
| `breadcrumb.tsx` | `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis` | Navegação hierárquica |
| `button.tsx` | `Button` | Botão com variantes: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `hero`, `hero-outline` |
| `calendar.tsx` | `Calendar` | Seletor de data (react-day-picker) — disponibilidade |
| `card.tsx` | `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent` | Cards de dashboard e listagens |
| `carousel.tsx` | `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext` | Carrossel de conteúdo |
| `chart.tsx` | `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent` | Wrapper para gráficos Recharts |
| `checkbox.tsx` | `Checkbox` | Checkboxes de formulário e checklists de análise |
| `collapsible.tsx` | `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` | Seções recolhíveis |
| `command.tsx` | `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator` | Paleta de comandos / busca |
| `context-menu.tsx` | `ContextMenu` e subcomponentes | Menu de contexto (clique direito) |
| `dialog.tsx` | `Dialog`, `DialogPortal`, `DialogOverlay`, `DialogTrigger`, `DialogClose`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` | Modals — BookingDetailDialog, serviços, etc. |
| `drawer.tsx` | `Drawer` e subcomponentes | Drawer mobile (Vaul) |
| `dropdown-menu.tsx` | `DropdownMenu` e subcomponentes | Menus de contexto em botões |
| `form.tsx` | `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` | Wrapper react-hook-form + validação |
| `hover-card.tsx` | `HoverCard`, `HoverCardTrigger`, `HoverCardContent` | Popover ao hover |
| `input-otp.tsx` | `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator` | Entrada de código OTP |
| `input.tsx` | `Input` | Campo de texto genérico |
| `label.tsx` | `Label` | Rótulo de formulário acessível |
| `menubar.tsx` | `Menubar` e subcomponentes | Barra de menus estilo desktop |
| `navigation-menu.tsx` | `NavigationMenu` e subcomponentes | Menu de navegação com submenus |
| `pagination.tsx` | `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis` | Paginação de tabelas |
| `popover.tsx` | `Popover`, `PopoverTrigger`, `PopoverContent` | Balões flutuantes (ex.: calendário) |
| `progress.tsx` | `Progress` | Barra de progresso |
| `radio-group.tsx` | `RadioGroup`, `RadioGroupItem` | Seleção de opção única |
| `resizable.tsx` | `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle` | Painéis redimensionáveis |
| `scroll-area.tsx` | `ScrollArea`, `ScrollBar` | Área com scroll estilizado |
| `select.tsx` | `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectLabel`, `SelectItem`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton` | Dropdowns de seleção |
| `separator.tsx` | `Separator` | Linha divisória horizontal/vertical |
| `sheet.tsx` | `Sheet`, `SheetPortal`, `SheetOverlay`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription` | Painel lateral deslizante |
| `sidebar.tsx` | `Sidebar` e subcomponentes (shadcn sidebar) | Estrutura de sidebar do painel |
| `skeleton.tsx` | `Skeleton` | Placeholder animado de carregamento |
| `slider.tsx` | `Slider` | Controle deslizante de valor |
| `sonner.tsx` | `Toaster` | Notificações toast via Sonner |
| `switch.tsx` | `Switch` | Toggle on/off |
| `table.tsx` | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption` | Tabelas de dados (agendamentos, clientes) |
| `tabs.tsx` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Navegação por abas |
| `textarea.tsx` | `Textarea` | Campo de texto multilinha |
| `toast.tsx` | `Toast`, `ToastAction`, `ToastClose`, `ToastDescription`, `ToastProvider`, `ToastTitle`, `ToastViewport` | Sistema de toast (legado — preferir Sonner) |
| `toaster.tsx` | `Toaster` | Provider do sistema de toast legado |
| `toggle-group.tsx` | `ToggleGroup`, `ToggleGroupItem` | Grupo de toggles exclusivos |
| `toggle.tsx` | `Toggle` | Botão toggle individual |
| `tooltip.tsx` | `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | Dica ao hover |

## Variantes customizadas do Button

As variantes abaixo foram adicionadas ao projeto (não são padrão shadcn):

| Variante | Uso |
|----------|-----|
| `hero` | CTA principal da landing page (gradiente rosa) |
| `hero-outline` | CTA secundário da landing page (borda rosa) |
