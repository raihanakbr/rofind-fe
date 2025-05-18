import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ExternalLink, Users, Gamepad, Star, Flame, Trophy } from "lucide-react"
import Image from "next/image"
import type { Game } from "@/lib/types"

interface GameModalProps {
  game: Game | null
  isOpen: boolean
  onClose: () => void
}

export function GameModal({ game, isOpen, onClose }: GameModalProps) {
  if (!game) return null

  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Determine genres to display
  const genresToShow = []
  if (game.genre_l1) genresToShow.push(game.genre_l1)
  if (game.genre_l2 && game.genre_l2 !== game.genre_l1) genresToShow.push(game.genre_l2)
  if (genresToShow.length === 0 && game.genres) genresToShow.push(...game.genres)

  // Use imageUrl if available, otherwise fall back to thumbnail or placeholder
  const imageSource =
    game.imageUrl || game.thumbnail || `/placeholder.svg?height=432&width=768&text=${encodeURIComponent(game.name)}`

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gradient-to-br from-[#2a0066] to-[#1a0033] text-white border-[#4f00b3] max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl p-0">
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <Image src={imageSource || "/placeholder.svg"} alt={game.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0033] to-transparent" />

          <div className="absolute bottom-0 left-0 w-full p-6">
            <DialogTitle
              className="text-3xl font-extrabold text-white mb-2"
              dangerouslySetInnerHTML={{ __html: game.formattedName || game.name }}
            />
            <DialogDescription className="text-purple-200 flex items-center">
              By{" "}
              <span className="font-medium text-white ml-1">
                {game.creator?.name || (typeof game.creator === "string" ? game.creator : "Unknown")}
              </span>
              {game.creator?.hasVerifiedBadge && (
                <Badge className="ml-1 bg-[#00b3ff] text-white h-5 w-5 flex items-center justify-center p-0 rounded-full">
                  ✓
                </Badge>
              )}
            </DialogDescription>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Game stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-[#3a0099] p-4 rounded-xl pulsing">
              <Flame className="h-6 w-6 mx-auto mb-2 text-[#ff3366]" />
              <div className="text-sm text-purple-200">Playing</div>
              <div className="font-bold text-xl">{game.playing.toLocaleString()}</div>
            </div>
            <div className="bg-[#3a0099] p-4 rounded-xl pulsing" style={{ animationDelay: "0.3s" }}>
              <div className="h-6 w-6 mx-auto mb-2">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vnxYMDksFirVdQoBDCD6PvpfZ1pzYA.png"
                  alt="Visits"
                  width={24}
                  height={24}
                  className="mx-auto"
                />
              </div>
              <div className="text-sm text-purple-200">Visits</div>
              <div className="font-bold text-xl">{game.visits?.toLocaleString() || "0"}</div>
            </div>
            <div className="bg-[#3a0099] p-4 rounded-xl pulsing" style={{ animationDelay: "0.6s" }}>
              <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
              <div className="text-sm text-purple-200">Favorites</div>
              <div className="font-bold text-xl">{game.favoritedCount?.toLocaleString() || "0"}</div>
            </div>
          </div>

          {/* Game description */}
          <div className="bg-[#3a0099]/50 p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-white">About This Game</h3>
            <p className="text-purple-200 whitespace-pre-line">{game.description}</p>
          </div>

          {/* Game details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#3a0099]/50 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-white">Details</h3>
              <ul className="space-y-4 text-purple-200">
                {game.maxPlayers && (
                  <li className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-[#00b3ff]" />
                    <span>
                      Max Players: <span className="text-white font-medium">{game.maxPlayers}</span>
                    </span>
                  </li>
                )}
                {genresToShow.length > 0 && (
                  <li>
                    <div className="flex items-start">
                      <Gamepad className="h-5 w-5 mr-3 text-[#00b3ff] mt-1" />
                      <div>
                        <span>Genres:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {genresToShow.map((genre) => (
                            <Badge key={genre} className="fun-badge">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                )}
                {game.price !== undefined && game.price !== null && (
                  <li className="flex items-center">
                    <Star className="h-5 w-5 mr-3 text-[#00b3ff]" />
                    <span>
                      Price: <span className="text-white font-medium">{game.price === 0 ? "Free" : game.price}</span>
                    </span>
                  </li>
                )}
              </ul>
            </div>
            <div className="bg-[#3a0099]/50 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-white">Timeline</h3>
              <ul className="space-y-4 text-purple-200">
                <li className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-[#ff3366]" />
                  <span>
                    Created:{" "}
                    <span className="text-white font-medium">{formatDate(game.created || game.releaseDate)}</span>
                  </span>
                </li>
                <li className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-[#ff3366]" />
                  <span>
                    Updated:{" "}
                    <span className="text-white font-medium">{formatDate(game.updated || game.lastUpdated)}</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-center pt-4">
            <Button className="fun-button text-white text-lg font-bold px-8 py-6 rounded-xl" asChild>
              <a
                href={`https://roblox.com/games/${game.rootPlaceId || game.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Play Now <ExternalLink className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
