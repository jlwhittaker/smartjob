FROM python
COPY ./requirements.txt ./app/requirements.txt
WORKDIR ./app
RUN pip install -r requirements.txt
COPY . /app
CMD ["bash"]
