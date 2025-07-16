
import { useState } from 'react'
import Container from '@mui/material/Container'
import './App.css'
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

function App() {
const [emailContent, setEmailContent] = useState('');
const [tone, setTone] = useState('');
const [generatedReply, setGeneratedReply] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');


const handleSubmit = async () => {
  setLoading(true);
  setError('');

  try{

    const res = await axios.post("http://localhost:8080/api/email/generate", {
      emailContent, 
      tone
    });

    // setGeneratedReply(typeof res.data === 'string' ? res.data : JSON.stringify(res.data))
    console.log("Received raw reply:", res.data); // <- Add this log
    setGeneratedReply(res.data);

  }catch(error){
    setError('Failed to generate email reply. Please try again later!')
    console.log(error);
  }finally{
    setLoading(false);
  }
};

  return (
    <Container maxWidth = "md" sx={{py:4}}>
      <Typography variant='h3' component="h1" gutterBottom>
        Email Reply Generator
      </Typography>
     
     <Box sx={{mx:3}}>
      <TextField
        fullWidth
        multiline
        rows={6}
        variant='outlined'
        label='Original Email Content'
        value={emailContent || ''}
        onChange={(e) => setEmailContent(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{mb:2}}
        />
       
       <FormControl fullWidth sx={{ mb: 2}}>
        <InputLabel>Tone(Optional)</InputLabel>
        <Select 
          value={tone || ''}
          label={"Tone(Optional)"}
          onChange={(e) => setTone(e.target.value)}
        >
        
        <MenuItem value="Professional">Professional</MenuItem>
        <MenuItem value="Friendly">Friendly</MenuItem>
        <MenuItem value="Casual">Casual</MenuItem>
        <MenuItem value="None">None</MenuItem>


        </Select>
       </FormControl>

       <Button
        variant='contained'
        onClick={handleSubmit}
        disabled={!emailContent || loading}
        fullWidth
       >
        {loading ? <CircularProgress size={24}/> : "Generate Reply"}
       </Button>
     </Box>

     {error && (
      <Typography color='error' sx={{mb : 2}}>
        {error}
      </Typography>
     )}

     {generatedReply && (
  <Box sx={{ mt: 3 }}>
    <Typography variant="h6" gutterBottom>
      Generated Reply
    </Typography>

    <Box>
      {generatedReply.split('\n\n').map((para, idx) => (
        <Typography key={idx} component="p" sx={{ mb: 2 }}>
          {para.trim()}
        </Typography>
      ))}
    </Box>

    <Button
      variant="outlined"
      sx={{ mt: 2 }}
      onClick={() => navigator.clipboard.writeText(generatedReply)}
    >
      Copy to Clipboard
    </Button>
  </Box>
)}
    </Container>
  )
}

export default App





