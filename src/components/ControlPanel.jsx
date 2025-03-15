import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { API_URL } from "../config";
import GlobalStyle from "../styles/GlobalStyle";

const GlobalOverride = styled.div`
  html, body, #root {
    overflow: auto !important;
  }
`;

const ControlPanel = () => {
  const [inputTime, setInputTime] = useState("30:00");
  const [timerState, setTimerState] = useState({
    time: 1800,
    isRunning: false,
  });

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentScene, setCurrentScene] = useState("landing");

  const [menuItems, setMenuItems] = useState([]);
  const [menuVisible, setMenuVisible] = useState(true);

  const [activeTab, setActiveTab] = useState("main");
  const [videoUrl, setVideoUrl] = useState('');


  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const response = await fetch(`${API_URL}/api/images`);
    const data = await response.json();
    setImages(data);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);

    try {
      await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      await fetchImages();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (imageUrl) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this image?");
  
    if (!isConfirmed) {
      return; // Exit if user cancels
    }

    try {
      const filename = imageUrl.split("/").pop();
      await fetch(`${API_URL}/api/images/${filename}`, {
        method: "DELETE",
      });
      await fetchImages();
      if (selectedImage === imageUrl) {
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  const handleBackgroundSelect = async (imageUrl) => {
    try {
      await fetch(`${API_URL}/api/background`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backgroundImage: imageUrl }),
      });
    } catch (error) {
      console.error("Failed to set background:", error);
    }
  };

  const clearBackground = async () => {
    try {
      await fetch(`${API_URL}/api/background`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backgroundImage: "" }),
      });
    } catch (error) {
      console.error("Failed to clear background:", error);
    }
  };

  const handleSceneChange = async (scene) => {
    try {
      await fetch(`${API_URL}/api/scene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene }),
      });
      setCurrentScene(scene);
    } catch (error) {
      console.error("Failed to change scene:", error);
    }
  };

  // Add this new function to format numeric input to seconds
  const parseTimeInput = (input) => {
    // Handle MM:SS format
    if (input.includes(":")) {
      const [minutes, seconds] = input.split(":").map(Number);
      return minutes * 60 + (seconds || 0);
    }
    // Handle MMSS format
    const cleanInput = input.replace(/[^\d]/g, "").padStart(4, "0");
    const minutes = parseInt(cleanInput.slice(0, -2));
    const seconds = parseInt(cleanInput.slice(-2));
    return minutes * 60 + seconds;
  };

  const formatTimeInput = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const fetchTimerState = async () => {
    try {
      const response = await fetch(`${API_URL}/api/timer`);
      const data = await response.json();
      setTimerState(data);
    } catch (error) {
      console.error("Failed to fetch timer state:", error);
    }
  };

  useEffect(() => {
    fetchTimerState();
    const interval = setInterval(() => {
      if (timerState.isRunning) {
        fetchTimerState();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState.isRunning]);

  const handleTimeSubmit = async (e) => {
    e.preventDefault();
    const totalSeconds = parseTimeInput(inputTime);

    try {
      const response = await fetch(`${API_URL}/api/timer/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: totalSeconds }),
      });
      const data = await response.json();
      setTimerState(data);
    } catch (error) {
      console.error("Failed to set timer:", error);
    }
  };

  const toggleTimer = async () => {
    try {
      const response = await fetch(`${API_URL}/api/timer/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setTimerState(data);
    } catch (error) {
      console.error("Failed to toggle timer:", error);
    }
  };

  const handleVideoSubmit = async () => {
    // Extract video ID from URL
    const videoId = videoUrl.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/)?.[1];
    
    if (!videoId && videoUrl!== '') {
      alert('Please enter a valid YouTube URL');
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/api/video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });
      
      if (!response.ok) throw new Error('Failed to update video');
      setVideoUrl('');
    } catch (error) {
      console.error('Error updating video:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${API_URL}/api/menu/items`);
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleMenuItemUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("menuItem", file);

    try {
      const response = await fetch(`${API_URL}/api/menu/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      await fetchMenuItems();
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleMenuItemDelete = async (itemId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this image?");
  
    if (!isConfirmed) {
      return; // Exit if user cancels
    }

    try {
      const response = await fetch(`${API_URL}/api/menu/items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete menu item");
      }

      // Refresh the menu items list after deletion
      const updatedResponse = await fetch(`${API_URL}/api/menu/items`);
      const updatedItems = await updatedResponse.json();
      setMenuItems(updatedItems);
    } catch (error) {
      console.error("Failed to delete menu item:", error);
    }
  };

  const toggleItemAvailability = async (itemId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/menu/items/${itemId}/toggle`,
        {
          method: "PATCH",
        }
      );
      await fetchMenuItems();
    } catch (error) {
      console.error("Failed to toggle item availability:", error);
    }
  };

  const toggleMenuVisibility = async () => {
    try {
      const response = await fetch(`${API_URL}/api/menu/visibility`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVisible: !menuVisible }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle menu visibility");
      }

      setMenuVisible(!menuVisible);
    } catch (error) {
      console.error("Failed to toggle menu visibility:", error);
    }
  };
  return (
    <>
      <GlobalStyle />
      <GlobalOverride />
      <Container>
          <Title>Control Panel</Title>

          <TabContainer>
            <Tab
              $active={activeTab === "main"}
              onClick={() => setActiveTab("main")}
            >
              Main
            </Tab>
            <Tab
              $active={activeTab === "background"}
              onClick={() => setActiveTab("background")}
            >
              Background
            </Tab>
            <Tab
              $active={activeTab === "menu"}
              onClick={() => setActiveTab("menu")}
            >
              Menu
            </Tab>
          </TabContainer>

          <TabContent $active={activeTab === "main"}>
            <SceneSelector>
              <SectionTitle>Scene Selection</SectionTitle>
              <ButtonGroup>
                <SceneButton
                  $active={currentScene === "landing"}
                  onClick={() => handleSceneChange("landing")}
                >
                  Landing
                </SceneButton>
                <SceneButton
                  $active={currentScene === "timer"}
                  onClick={() => handleSceneChange("timer")}
                >
                  Timer
                </SceneButton>
              </ButtonGroup>
            </SceneSelector>
            <Form onSubmit={handleTimeSubmit}>
              <InputGroup>
                <SectionTitle>Timer Settings</SectionTitle>
                <Label htmlFor="time">Set Time (MMSS):</Label>
                <QuickTimerButtons>
                  {[60, 50, 45, 40, 35, 30, 25, 20, 15].map((minutes) => (
                    <QuickTimerButton
                      key={minutes}
                      type="button"
                      onClick={async () => {
                        try {
                          const response = await fetch(`${API_URL}/api/timer/set`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ time: minutes * 60 }),
                          });
                          const data = await response.json();
                          setTimerState(data);
                          setInputTime(`${minutes}:00`);
                        } catch (error) {
                          console.error("Failed to set timer:", error);
                        }
                      }}
                    >
                      {minutes}min
                    </QuickTimerButton>
                  ))}
                </QuickTimerButtons>
                <Input
                  type="text"
                  id="time"
                  pattern="^(\d{1,4}|\d{1,2}:\d{0,2})$"
                  value={inputTime}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.includes(":")) {
                      // Handle MM:SS format
                      if (value.length <= 5) {
                        setInputTime(value);
                      }
                    } else {
                      // Handle MMSS format
                      const numericValue = value.replace(/[^\d]/g, "");
                      if (numericValue.length <= 4) {
                        setInputTime(numericValue);
                      }
                    }
                  }}
                  placeholder="1055 or 10:55"
                />
              </InputGroup>
              <ButtonGroup>
                <Button type="submit">Set Time</Button>
                <Button
                  type="button"
                  onClick={toggleTimer}
                  $isRunning={timerState.isRunning}
                >
                  {timerState.isRunning ? "Pause" : "Start"}
                </Button>
              </ButtonGroup>
            </Form>
            <StatusText>
              Current Time: {Math.floor(timerState.time / 60)}:
              {(timerState.time % 60).toString().padStart(2, "0")}
            </StatusText>
            <Section>
              <h2>YouTube Video Control</h2>
              <InputGroup>
                <Input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste YouTube URL here"
                />
                <Button onClick={handleVideoSubmit}>Set Video</Button>
                <Button onClick={() => {
                  setVideoUrl('');
                  handleVideoSubmit();
                }}>Clear Video</Button>
              </InputGroup>
            </Section>
          </TabContent>
          <TabContent $active={activeTab === "background"}>
            <GallerySection>
              <SectionTitle>Background Images</SectionTitle>
              <ButtonGroup>
                <UploadButton>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload">Upload New Background</label>
                </UploadButton>
                <ClearButton onClick={clearBackground}>
                  Clear Background
                </ClearButton>
              </ButtonGroup>

              {selectedImage && (
                <SelectedImageActions>
                  <Button onClick={() => handleBackgroundSelect(selectedImage)}>
                    Set as Background
                  </Button>
                  <DeleteButton
                    onClick={() => handleImageDelete(selectedImage)}
                  >
                    Delete Image
                  </DeleteButton>
                </SelectedImageActions>
              )}

              <ImageGrid>
                {images.map((image, index) => (
                  <ImageThumbnail
                    key={index}
                    onClick={() => setSelectedImage(image.url)}
                    src={image.url}
                    alt={`Background ${index + 1}`}
                    $isSelected={selectedImage === image.url}
                  />
                ))}
              </ImageGrid>
            </GallerySection>
          </TabContent>
          <TabContent $active={activeTab === "menu"}>
            <MenuSection>
              <SectionTitle>Menu Items</SectionTitle>
              <ButtonGroup>
                <UploadButton>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMenuItemUpload}
                    style={{ display: "none" }}
                    id="menuItemUpload"
                  />
                  <label htmlFor="menuItemUpload">Add Menu Item</label>
                </UploadButton>
                <Button onClick={toggleMenuVisibility} $active={menuVisible}>
                  {menuVisible ? "Hide Menu" : "Show Menu"}
                </Button>
              </ButtonGroup>

              <MenuItemsGrid>
                {menuItems.map((item) => (
                  <MenuItemControl key={item.id}>
                    <MenuItemImage src={item.imageUrl} alt={item.name} />
                    <MenuItemActions>
                      <Checkbox
                        type="checkbox"
                        checked={item.unavailable}
                        onChange={() => toggleItemAvailability(item.id)}
                      />
                      <DeleteButton
                        onClick={() => handleMenuItemDelete(item.id)}
                      >
                        ×
                      </DeleteButton>
                    </MenuItemActions>
                  </MenuItemControl>
                ))}
              </MenuItemsGrid>
            </MenuSection>
          </TabContent>
      </Container>
    </>
  );
};

const ClearButton = styled.button`
  background: #6c757d;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background: #5a6268;
  }
`;

const Section = styled.div`
  margin: 2rem 0;
  padding: 1rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: black;
  font-family: 'DM Sans', sans-serif;
  color: white;
  padding: 2rem;
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  /* Add custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const Title = styled.h1`
  margin-bottom: 2rem;
  text-align: center;
  color: white;
  padding-top: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 1.1rem;
  color: white;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 1.2rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background: ${(props) => (props.$isRunning ? "#dc3545" : "#28a745")};
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${(props) => (props.$isRunning ? "#c82333" : "#218838")};
  }
`;

const StatusText = styled.div`
  margin-top: 2rem;
  text-align: center;
  font-size: 1.2rem;
  color: white;
`;

const GallerySection = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: white;
  margin-bottom: 1rem;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 1rem;
`;

const SelectedImageActions = styled.div`
  display: flex;
  gap: 10px;
  margin: 1rem 0;
  justify-content: center;
`;

const DeleteButton = styled.button`
  padding: 8px 16px;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background: #dc3545;
  color: white;
  cursor: pointer;
  
  &:hover {
    background: #c82333;
  }
`;

const ImageThumbnail = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid ${(props) =>
    props.$isSelected ? "#007bff" : "transparent"};
  border-radius: 4px;
  
  &:hover {
    border-color: #007bff;
  }
`;

const UploadButton = styled.div`
  label {
    background: #007bff;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    display: inline-block;
    
    &:hover {
      background: #0056b3;
    }
  }
`;

const SceneSelector = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const SceneButton = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background: ${(props) => (props.$active ? "#007bff" : "#6c757d")};
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? "#0056b3" : "#5a6268")};
  }
`;

const MenuSection = styled(GallerySection)`
  // Inherits styles from GallerySection
`;

const MenuItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 1rem 0;
`;

const MenuItemControl = styled.div`
  position: relative;
  aspect-ratio: 1;
`;

const MenuItemImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
`;

const MenuItemActions = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  gap: 5px;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const Tab = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  border: none;
  border-radius: 4px 4px 0 0;
  background: ${(props) => (props.$active ? "#007bff" : "#e9ecef")};
  color: ${(props) => (props.$active ? "white" : "#333")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? "#0056b3" : "#dee2e6")};
  }
`;

const TabContent = styled.div`
  display: ${props => props.$active ? 'block' : 'none'};
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 2rem;
`;

const QuickTimerButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 10px 0;
`;

const QuickTimerButton = styled.button`
  padding: 8px;
  font-size: 0.9rem;
  border: none;
  border-radius: 4px;
  background: #444;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #666;
  }
`;

export default ControlPanel;