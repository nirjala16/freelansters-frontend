"use client"

import PropTypes from "prop-types"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Simple emoji data - in a real app, you'd use a more comprehensive library
const emojiCategories = {
  recent: ["😀", "😂", "❤️", "👍", "🙏", "🔥", "✨"],
  smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘"],
  people: ["👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👵", "🧓", "👴", "👲", "👳‍♀️", "👳‍♂️", "🧕", "👮‍♀️", "👮‍♂️"],
  animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵"],
  food: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅"],
  activities: ["⚽️", "🏀", "🏈", "⚾️", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🏓", "🏸", "🏒", "🏑", "🥍"],
  travel: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", "🛴", "🚲"],
  symbols: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "♥️", "💘", "💝", "💖", "💗", "💓", "💞", "💕"],
}

const EmojiPicker = ({ onEmojiSelect }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("recent")

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji)

    // In a real app, you would update the recent emojis here
  }

  const filteredEmojis = searchQuery
    ? Object.values(emojiCategories)
        .flat()
        .filter((emoji) => emoji.includes(searchQuery))
    : emojiCategories[activeCategory]

  return (
    <div className="w-64 h-[300px] flex flex-col">
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emoji"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
      </div>

      {searchQuery ? (
        <ScrollArea className="flex-1 p-2">
          <div className="grid grid-cols-7 gap-1">
            {filteredEmojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted cursor-pointer text-lg"
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
          {filteredEmojis.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">No emojis found</p>
          )}
        </ScrollArea>
      ) : (
        <Tabs
          defaultValue="recent"
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-8 h-9 bg-transparent">
            <TabsTrigger value="recent" className="data-[state=active]:bg-muted">
              🕒
            </TabsTrigger>
            <TabsTrigger value="smileys" className="data-[state=active]:bg-muted">
              😀
            </TabsTrigger>
            <TabsTrigger value="people" className="data-[state=active]:bg-muted">
              👨
            </TabsTrigger>
            <TabsTrigger value="animals" className="data-[state=active]:bg-muted">
              🐶
            </TabsTrigger>
            <TabsTrigger value="food" className="data-[state=active]:bg-muted">
              🍔
            </TabsTrigger>
            <TabsTrigger value="activities" className="data-[state=active]:bg-muted">
              ⚽️
            </TabsTrigger>
            <TabsTrigger value="travel" className="data-[state=active]:bg-muted">
              🚗
            </TabsTrigger>
            <TabsTrigger value="symbols" className="data-[state=active]:bg-muted">
              ❤️
            </TabsTrigger>
          </TabsList>

          {Object.keys(emojiCategories).map((category) => (
            <TabsContent key={category} value={category} className="flex-1 mt-0 border-0 p-0">
              <ScrollArea className="h-full p-2">
                <div className="grid grid-cols-7 gap-1">
                  {emojiCategories[category].map((emoji, index) => (
                    <button
                      key={`${emoji}-${index}`}
                      className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted cursor-pointer text-lg"
                      onClick={() => handleEmojiClick(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}

EmojiPicker.propTypes = {
  onEmojiSelect: PropTypes.func.isRequired,
}

export default EmojiPicker

