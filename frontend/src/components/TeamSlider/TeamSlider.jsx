import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Modal,
  IconButton,
  Avatar,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const teamMembers = [
  {
    id: 1,
    name: 'Иван Петров',
    position: 'Frontend разработчик',
    photo: '/images/team/ivan.jpg',
    description: 'Специалист по React и TypeScript с 5-летним опытом.',
    fullInfo: 'Иван присоединился к нашей команде в 2018 году. За это время он реализовал более 20 крупных проектов.'
  },
  {
    id: 2,
    name: 'Елена Смирнова',
    position: 'UX/UI дизайнер',
    photo: '/images/team/elena.jpg',
    description: 'Создает интуитивно понятные интерфейсы с 2016 года.',
    fullInfo: 'Елена - сертифицированный специалист по Material Design и Figma.'
  },
  {
    id: 3,
    name: 'Алексей Козлов',
    position: 'Backend разработчик',
    photo: '/images/team/alexey.jpg',
    description: 'Node.js и Python эксперт с опытом работы в крупных проектах.',
    fullInfo: 'Алексей разрабатывает высоконагруженные API для наших клиентов.'
  },
  {
    id: 4,
    name: 'Ольга Новикова',
    position: 'Менеджер проектов',
    photo: '/images/team/olga.jpg',
    description: 'Управляет проектами по методологии Agile.',
    fullInfo: 'Ольга координирует работу команд и взаимодействие с клиентами.'
  }
];

// Кастомные стрелки с центральным позиционированием


const NextArrow = ({ onClick }) => (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'absolute',
        right: { xs: -20, md: -40 },
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
        bgcolor: 'background.paper',
        boxShadow: 3,
        width: 40,
        height: 40,
        '&:hover': {
          bgcolor: 'primary.main',
          color: 'white'
        }
      }}
    >
      <ArrowForwardIosIcon fontSize="small" />
    </IconButton>
  );
  
  const PrevArrow = ({ onClick }) => (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'absolute',
        left: { xs: -20, md: -40 },
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
        bgcolor: 'background.paper',
        boxShadow: 3,
        width: 40,
        height: 40,
        '&:hover': {
          bgcolor: 'primary.main',
          color: 'white'
        }
      }}
    >
      <ArrowBackIosNewIcon fontSize="small" />
    </IconButton>
  );
  
  const TeamSlider = () => {
    const [open, setOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const sliderRef = useRef(null);
    const theme = useTheme();

    const handleOpen = (member) => {
        setSelectedMember(member);
        setOpen(true);
        if (sliderRef.current) sliderRef.current.slickPause();
      };
    
    const handleClose = () => {
        setOpen(false);
        if (sliderRef.current) sliderRef.current.slickPlay();
      };
  
    // Оптимизированные настройки слайдера
    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 3,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        arrows: true,
        accessibility: true,
        useCSS: true,
        cssEase: 'ease-in-out',
        edgeFriction: 0.3,
        swipeToSlide: true,
        adaptiveHeight: false,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 2,
              arrows: true
            }
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
              arrows: false
            }
          }
        ]
      };
  
    // Выравнивание высоты карточек
    useEffect(() => {
        const equalizeHeights = () => {
          const cards = document.querySelectorAll('.team-card');
          let maxHeight = 0;
    
          cards.forEach(card => {
            card.style.height = 'auto';
            maxHeight = Math.max(maxHeight, card.offsetHeight);
          });
    
          cards.forEach(card => {
            card.style.height = `${maxHeight}px`;
          });
        };
    
        equalizeHeights();
        window.addEventListener('resize', equalizeHeights);
        return () => window.removeEventListener('resize', equalizeHeights);
      }, []);
  
      return (
        <Box sx={{
          maxWidth: '1200px',
          mx: 'auto',
          px: { xs: 4, md: 6 },
          py: 6,
          position: 'relative',
          '& .slick-list': {
            overflow: 'hidden',
            margin: '0 -15px',
            padding: '30px 0'
          },
          '& .slick-slide': {
            padding: '0 15px',
            transition: 'transform 0.3s ease',
            '& > div': {
              height: '100%'
            }
          },
          '& .slick-track': {
            display: 'flex',
            alignItems: 'stretch'
          }
        }}>



<Slider {...settings} ref={sliderRef}>
        {teamMembers.map((member) => (
          <Box key={member.id}>
            <Card className="team-card" sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: 6
              }
            }}>
              <CardMedia
                component="img"
                height="240"
                image={member.photo}
                alt={member.name}
                sx={{
                  objectFit: 'cover',
                  [theme.breakpoints.down('sm')]: {
                    height: '200px'
                  }
                }}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h3">
                    {member.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {member.position}
                  </Typography>
                  <Typography variant="body2" paragraph sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {member.description}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleOpen(member)}
                  sx={{ mt: 2, alignSelf: 'flex-start' }}
                >
                  Подробнее
                </Button>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Slider>

      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}
      >
        <Box sx={{
          width: { xs: '90%', md: '600px' },
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
          outline: 'none',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>

          {selectedMember && (
            <>
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3,
                mb: 3
              }}>
                <Avatar
                  src={selectedMember.photo}
                  alt={selectedMember.name}
                  sx={{
                    width: { xs: 120, sm: 160 },
                    height: { xs: 120, sm: 160 },
                    mx: 'auto'
                  }}
                />
                <Box>
                  <Typography id="member-modal-title" variant="h4" component="h2">
                    {selectedMember.name}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {selectedMember.position}
                  </Typography>
                </Box>
              </Box>

              <Typography id="member-modal-description" paragraph>
                {selectedMember.fullInfo}
              </Typography>

              <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mt: 3
              }}>
                <Button
                  variant="contained"
                  onClick={handleClose}
                >
                  Закрыть
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default TeamSlider;