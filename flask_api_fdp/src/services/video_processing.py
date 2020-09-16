import face_recognition
import cv2
import uuid


def process_video(file):
    video_capture = cv2.VideoCapture(file)
    filenames = []
    known_face_encodings = []

    frame_count = 0
    while True:
        ret, frame = video_capture.read()
        if not ret:
            break
        frame_count += 1
        if frame_count % 15 != 0:
            continue
        # Resize frame of video to 1/4 size for faster face recognition processing
        small_frame = cv2.resize(frame, (0, 0), fx=0.10, fy=0.10)

        # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
        rgb_small_frame = small_frame[:, :, ::-1]

        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
            if True in matches:
                print("Face in " + str(frame_count) + " already regonized... skipping")
                continue
            else:
                for top, right, bottom, left in face_locations:
                    cropped_frame = small_frame[top:bottom, left:right]
                    file_name = file + str(frame_count) + str(uuid.uuid4()) + '.png'
                    cv2.imwrite(file_name, cropped_frame)
                    filenames.append(file_name)
                    known_face_encodings.append(face_encoding)
    video_capture.release()
    return filenames