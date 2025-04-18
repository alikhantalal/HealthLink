import os
import logging
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DBConnector:
    """Class for handling MongoDB operations"""
    
    def __init__(self):
        """Initialize the database connection"""
        try:
            # Get MongoDB connection string from environment variables
            # or use default local connection
            mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
            db_name = os.getenv('DB_NAME', 'healthlink')
            
            # Connect to MongoDB
            self.client = MongoClient(mongo_uri)
            self.db = self.client[db_name]
            
            # Define collections
            self.doctors_collection = self.db['doctors']
            self.verification_collection = self.db['verifications']
            
            logger.info(f"Connected to MongoDB: {db_name}")
            
        except Exception as e:
            logger.error(f"Database connection error: {str(e)}")
            raise
    
    def add_doctor_verification_request(self, doctor_data, verification_results):
        """
        Add a new doctor verification request to the database
        
        Parameters:
        - doctor_data: Dictionary containing doctor information
        - verification_results: Results of document verification
        
        Returns:
        - ID of inserted document
        """
        try:
            verification_doc = {
                'doctor_data': doctor_data,
                'verification_results': verification_results,
                'status': verification_results.get('status', 'pending_review'),
                'timestamp': {
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                }
            }
            
            result = self.verification_collection.insert_one(verification_doc)
            logger.info(f"Added verification request with ID: {result.inserted_id}")
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Error adding verification request: {str(e)}")
            raise
    
    def update_verification_status(self, verification_id, new_status, reviewer_notes=None):
        """
        Update the status of a verification request
        
        Parameters:
        - verification_id: ID of the verification request
        - new_status: New status to set
        - reviewer_notes: Optional notes from the reviewer
        
        Returns:
        - True if update was successful, False otherwise
        """
        try:
            update_data = {
                '$set': {
                    'status': new_status,
                    'timestamp.updated_at': datetime.utcnow()
                }
            }
            
            if reviewer_notes:
                update_data['$set']['reviewer_notes'] = reviewer_notes
                
            result = self.verification_collection.update_one(
                {'_id': ObjectId(verification_id)},
                update_data
            )
            
            logger.info(f"Updated verification {verification_id} to status: {new_status}")
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error updating verification status: {str(e)}")
            return False
    
    def get_verification_status(self, doctor_email=None, verification_id=None):
        """
        Get the status of a verification request by doctor email or verification ID
        
        Parameters:
        - doctor_email: Doctor's email address
        - verification_id: ID of the verification request
        
        Returns:
        - Verification document or None if not found
        """
        try:
            query = {}
            if verification_id:
                query['_id'] = ObjectId(verification_id)
            elif doctor_email:
                query['doctor_data.email'] = doctor_email
            else:
                return None
                
            result = self.verification_collection.find_one(query)
            return result
            
        except Exception as e:
            logger.error(f"Error retrieving verification status: {str(e)}")
            return None
    
    def add_verified_doctor(self, doctor_data, document_paths=None):
        """
        Add a new verified doctor to the database
        
        Parameters:
        - doctor_data: Dictionary containing doctor information
        - document_paths: Optional dictionary with paths to verified documents
        
        Returns:
        - ID of inserted doctor document
        """
        try:
            # Prepare doctor document
            doctor_doc = {
                'name': doctor_data.get('name'),
                'email': doctor_data.get('email'),
                'specialization': doctor_data.get('specialization'),
                'qualification': doctor_data.get('qualification', []),
                'experience': doctor_data.get('experience', 0),
                'fee': doctor_data.get('fee', 0),
                'profile': document_paths.get('profile_photo', '') if document_paths else '',
                'verified': True,
                'document_paths': document_paths,
                'created_at': datetime.utcnow()
            }
            
            result = self.doctors_collection.insert_one(doctor_doc)
            logger.info(f"Added verified doctor with ID: {result.inserted_id}")
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Error adding verified doctor: {str(e)}")
            raise